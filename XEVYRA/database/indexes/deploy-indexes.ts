import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { MONGO_INDEXES } from './mongo-indexes.js';

async function deployIndexes() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xevyra_dev';
  const dbName = process.env.MONGODB_DB_NAME || 'xevyra_dev';

  console.log(`Deploying indexes to MongoDB: ${dbName}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    for (const def of MONGO_INDEXES) {
      const collection = db.collection(def.collection);
      const indexName = await collection.createIndex(def.spec as any, def.options || {});
      console.log(`✓ [${def.collection}] Index ensured: ${indexName}`);
    }

    console.log('All MongoDB indexes deployed successfully.');
  } catch (error) {
    console.error('Failed to deploy MongoDB indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

deployIndexes();
