require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ReservationReleaseService } = require('../src/modules/orders/services/reservation-release.service');

function setup({ found = true, release = true } = {}) {
  const calls = [];
  const session = {
    withTransaction: async (fn) => { calls.push('begin'); await fn(); calls.push('commit'); },
    endSession: async () => calls.push('end'),
  };
  const order = { id: 'order-1', items: [{ productId: 'product-1', quantity: 2 }] };
  const transition = async (id, actualSession) => { calls.push(['transition', id, actualSession]); return found ? order : null; };
  const orders = { cancelIfPending: transition, expireReservationIfPending: transition };
  const products = {
    releaseReservedStock: async (id, qty, actualSession) => { calls.push(['stock', id, qty, actualSession]); return release; },
    notifyStockChanges: (...ids) => calls.push(['notify', ...ids]),
  };
  return { service: new ReservationReleaseService(orders, products, { startSession: async () => session }), calls, session, order };
}

test('cancellation and stock release share the same session', async () => {
  const { service, calls, session, order } = setup();
  assert.equal(await service.cancel(order), true);
  assert.equal(calls[1][2], session);
  assert.equal(calls[2][3], session);
  assert.deepEqual(calls.slice(-3), ['commit', ['notify', 'product-1'], 'end']);
});

test('failed stock release prevents a successful transaction', async () => {
  const { service, calls, order } = setup({ release: false });
  await assert.rejects(service.expire(order), /could not be released/);
  assert.equal(calls.includes('commit'), false);
  assert.equal(calls.some((call) => call[0] === 'notify'), false);
  assert.equal(calls.at(-1), 'end');
});

test('does not release an already transitioned order again', async () => {
  const { service, calls, order } = setup({ found: false });
  assert.equal(await service.cancel(order), false);
  assert.equal(calls.some((call) => call[0] === 'stock'), false);
  assert.equal(calls.some((call) => call[0] === 'notify'), false);
});
