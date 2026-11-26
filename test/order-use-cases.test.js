require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PaymentVerificationService } = require('../src/modules/orders/services/payment-verification.service');
const { FulfillmentService } = require('../src/modules/orders/services/fulfillment.service');
const { CheckoutService } = require('../src/modules/orders/services/checkout.service');

test('a forged callback status cannot skip gateway verification', async () => {
  const calls = [];
  const order = { id: 'order-1', status: 'PENDING', totalAmount: 1000, orderNumber: 'HD-1' };
  const service = new PaymentVerificationService(
    { findByTransactionRef: async () => order },
    { verifyPayment: async () => { calls.push('gateway'); return { success: true, refId: 'ref-1' }; } },
    { finalize: async () => calls.push('finalize') },
    { cancel: async () => calls.push('cancel') },
  );
  assert.equal((await service.verifyPayment('authority-1', 'NOK')).success, true);
  assert.deepEqual(calls, ['gateway', 'finalize']);
});

test('fulfillment requests a conditional database transition', async () => {
  let args;
  const service = new FulfillmentService({ updateStatus: async (...values) => { args = values; return { status: values[1] }; } });
  await service.updateStatus('HD-1', 'SHIPPED');
  assert.deepEqual(args, ['HD-1', 'SHIPPED', 'PROCESSING']);
  await assert.rejects(service.updateStatus('HD-1', 'PAID'));
});

test('checkout cancels a created order when gateway initiation fails', async () => {
  const calls = [];
  const order = { id: 'order-1', orderNumber: 'HD-1' };
  const service = new CheckoutService(
    { create: async () => order },
    { gatewayName: 'gateway', requestPayment: async () => { throw new Error('offline'); } },
    { getProductById: async () => ({ id: 'product-1', title: 'Lamp', price: 1000 }) },
    { reserveStock: async () => true },
    { getOrThrow: () => 'https://example.test/callback' },
    { cancel: async (value) => { assert.equal(value, order); calls.push('cancel'); } },
  );
  await assert.rejects(service.createOrderAndInitiatePayment({ items: [{ productId: 'product-1', quantity: 1 }], shippingAddress: { phoneNumber: '09120000000' } }, 'user-1'));
  assert.deepEqual(calls, ['cancel']);
});
