import mongoose from 'mongoose';

async function migrateOrderOwnership() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required.');
  }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME });
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection is unavailable.');

  const users = await db.collection('users').find({}, { projection: { _id: 1, phoneNumber: 1 } }).toArray();
  const userIdByPhone = new Map(users.map((user) => [user.phoneNumber, user._id.toString()]));
  const orders = await db.collection('orders').find({ userId: { $exists: false } }).toArray();

  const operations = [];
  let unmatched = 0;
  for (const order of orders) {
    const phone = order.shippingAddress?.phoneNumber;
    const userId = phone ? userIdByPhone.get(phone) : undefined;
    if (!userId) {
      unmatched++;
      continue;
    }
    operations.push({
      updateOne: {
        filter: { _id: order._id, userId: { $exists: false } },
        update: { $set: { userId } },
      },
    });
  }

  if (operations.length > 0) {
    await db.collection('orders').bulkWrite(operations, { ordered: false });
  }

  console.log(`Migrated ${operations.length} order(s); ${unmatched} order(s) need manual ownership assignment.`);
  await mongoose.disconnect();
}

migrateOrderOwnership().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
