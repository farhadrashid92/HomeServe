import dns from 'dns';
import { MongoClient } from 'mongodb';

// Bypass restrictive Windows/ISP DNS servers that fail to lookup SRV MongoDB records
dns.setServers(['8.8.8.8', '1.1.1.1']);

const LOCAL_URI = 'mongodb://127.0.0.1:27017/homeserve';
const ATLAS_URI = 'mongodb+srv://farhadrashid92_db_user:7Wp8yz56vaNwmM2o@homeservecluster.1zgyrfh.mongodb.net/?appName=HomeServeCluster';
const ATLAS_DB_NAME = 'homeserve'; // we'll use the same DB name

async function migrate() {
    console.log('Starting migration from Local MongoDB to Atlas...');
    const localClient = new MongoClient(LOCAL_URI);
    const atlasClient = new MongoClient(ATLAS_URI);

    try {
        await localClient.connect();
        console.log('✅ Connected to Local MongoDB');

        await atlasClient.connect();
        console.log('✅ Connected to Atlas MongoDB');

        const localDb = localClient.db();
        const atlasDb = atlasClient.db(ATLAS_DB_NAME);

        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections to migrate.`);

        for (const collInfo of collections) {
            const collectionName = collInfo.name;
            console.log(`\nMigrating collection: ${collectionName}...`);

            const localCollection = localDb.collection(collectionName);
            const atlasCollection = atlasDb.collection(collectionName);

            // Fetch all documents from local
            const docs = await localCollection.find({}).toArray();
            console.log(` - Found ${docs.length} documents.`);

            if (docs.length > 0) {
                // To avoid duplicate key errors if the script is run multiple times,
                // we'll clear the destination collection first, or skip docs that exist.
                // Clearing is safest for a fresh "migration".
                await atlasCollection.deleteMany({});
                console.log(` - Cleared destination collection.`);
                
                await atlasCollection.insertMany(docs);
                console.log(` - ✅ Successfully migrated ${docs.length} documents into ${collectionName}.`);
            } else {
                console.log(` - Skipped (empty).`);
            }
        }

        console.log('\n🎉 All data migrated successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await localClient.close();
        await atlasClient.close();
        console.log('Connections closed.');
    }
}

migrate();
