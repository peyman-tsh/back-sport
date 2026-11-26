require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PaymentFinalizationService } = require('../src/modules/orders/services/payment-finalization.service');

function setup({ stockResult = true, orderResult = true } = {}) {
  const calls = [];
  const session = {
    withTransaction: async (callback) => callback(),
    endSession: async () => calls.push('end'),
  };
  const orders = { markPaidIfPending: async (...args) => { calls.push(['paid', ...args]); return orderResult; } };
  const products = {
    finalizeReservedStock: async (...args) => { calls.push(['stock', ...args]); return stockResult; },
    deductStock: async () => { throw new Error('unexpected deduction'); },
    notifyStockChanges: (...ids) => calls.push(['notify', ...ids]),
  };
  const service = new PaymentFinalizationService(orders, products, { startSession: async () => session });
  const order = { id: 'order-1', isStockReserved: true, items: [{ productId: 'product-1', quantity: 2 }] };
  return { service, order, session, calls };
}

test('finalizes stock and order in the same session', async () => {
  const { service, order, session, calls } = setup();
  await service.finalize(order, 'ref-1');
  assert.equal(calls[0][0], 'stock');
  assert.equal(calls[0][3], session);
  assert.equal(calls[1][0], 'paid');
  assert.equal(calls[1][4], session);
  assert.deepEqual(calls[2], ['notify', 'product-1']);
  assert.equal(calls[3], 'end');
});

test('does not mark paid if the reservation cannot be finalized', async () => {
  const { service, order, calls } = setup({ stockResult: false });
  await assert.rejects(service.finalize(order, 'ref-1'), /reservation/);
  assert.equal(calls.some((call) => call[0] === 'paid'), false);
  assert.equal(calls.some((call) => call[0] === 'notify'), false);
  assert.equal(calls.at(-1), 'end');
});

test('rejects stale order status and ends session', async () => {
  const { service, order, calls } = setup({ orderResult: false });
  await assert.rejects(service.finalize(order, 'ref-1'), /no longer pending/);
  assert.equal(calls.some((call) => call[0] === 'notify'), false);
  assert.equal(calls.at(-1), 'end');
});
