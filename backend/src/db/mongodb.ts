import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

let client: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    client = new MongoClient(uri);
  }
  await client.connect();
  return client;
}

export async function getCheckpointer(): Promise<MongoDBSaver> {
  const mongoClient = await getMongoClient();
  return new MongoDBSaver({ client: mongoClient, dbName: "ai_tutor" });
}
