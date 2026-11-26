require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ProductCacheService } = require('../src/modules/products/services/product-cache.service');
const { ProductQueryService } = require('../src/modules/products/services/product-query.service');
const { ProductCommandService } = require('../src/modules/products/services/product-command.service');
const { ProductInventoryService } = require('../src/modules/products/services/product-inventory.service');
const { UpdateProductDto } = require('../src/modules/products/dto/update-product.dto');
const { plainToInstance } = require('class-transformer');
const { validateSync } = require('class-validator');

test('partial product updates validate stock without requiring creation fields', () => {
  assert.deepEqual(validateSync(plainToInstance(UpdateProductDto, { stock: 0 })), []);
  assert.ok(validateSync(plainToInstance(UpdateProductDto, { stock: -1 })).length > 0);
  assert.ok(validateSync(plainToInstance(UpdateProductDto, { stock: 1.5 })).length > 0);
});

test('a read started before invalidation cannot restore stale product cache', async () => {
  const cache = new ProductCacheService();
  let resolveFirst;
  let reads = 0;
  const repository = {
    findBySlug: async () => {
      reads++;
      return reads === 1 ? new Promise((resolve) => { resolveFirst = resolve; }) : { slug: 'lamp', stock: 5 };
    },
  };
  const query = new ProductQueryService(repository, cache);
  const first = query.getProductBySlug(' LAMP ');
  cache.invalidate();
  resolveFirst({ slug: 'lamp', stock: 0 });
  assert.equal((await first).stock, 0);
  assert.equal((await query.getProductBySlug('lamp')).stock, 5);
  assert.equal(reads, 2);
});

test('catalog updates normalize slugs and invalidate both old and new product pages', async () => {
  const notices = [];
  const repository = {
    findById: async () => ({ slug: 'old-slug' }),
    exists: async ({ slug }) => { assert.equal(slug, 'new-slug'); return false; },
    update: async (_id, changes) => { assert.equal(changes.slug, 'new-slug'); assert.equal(changes.isAvailable, false); return { slug: changes.slug }; },
  };
  const command = new ProductCommandService(repository, { notify: (...slugs) => notices.push(slugs) });
  await command.updateProduct('product-1', { slug: ' NEW-SLUG ', stock: 0 });
  assert.deepEqual(notices, [['old-slug', 'new-slug']]);
});

test('inventory invalidates cached availability only after a successful stock change', async () => {
  const notices = [];
  const repository = {
    reserveStock: async (_id, quantity) => quantity === 1,
    findById: async () => ({ slug: 'lamp' }),
  };
  const inventory = new ProductInventoryService(repository, {
    notify: () => notices.push('list'),
    revalidateSlugs: (...slugs) => notices.push(slugs),
  });
  assert.equal(await inventory.reserveStock('product-1', 2), false);
  assert.deepEqual(notices, []);
  assert.equal(await inventory.reserveStock('product-1', 1), true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(notices, ['list', ['lamp']]);
  await assert.rejects(inventory.reserveStock('product-1', 0), /positive integer/);
});
