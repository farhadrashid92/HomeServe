import { MongoMemoryServer } from 'mongodb-memory-server';

async function run() {
  console.log("Starting MongoMemoryServer download...");
  try {
    const server = await MongoMemoryServer.create();
    console.log("Successfully downloaded and started at:", server.getUri());
    await server.stop();
  } catch (err) {
    console.error("Fatal error during MongoMemoryServer initialization:", err);
    process.exit(1);
  }
}

run();
