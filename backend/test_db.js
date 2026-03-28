import { MongoClient } from 'mongodb';
const uri = 'mongodb://farhadrashid92_db_user:7Wp8yz56vaNwmM2o@ac-xmhaekc-shard-00-00.h572ufu.mongodb.net:27017,ac-xmhaekc-shard-00-01.h572ufu.mongodb.net:27017,ac-xmhaekc-shard-00-02.h572ufu.mongodb.net:27017/homeserve?ssl=true&replicaSet=atlas-xmhaekc-shard-0&authSource=admin&retryWrites=true&w=majority&appName=HomeServeCluster';

async function run() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    console.log('Connecting to Atlas...');
    await client.connect();
    console.log('Connected successfully!');
    const dbs = await client.db().admin().listDatabases();
    console.log(dbs);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await client.close();
  }
}

run();
