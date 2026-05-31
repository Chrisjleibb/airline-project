import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI!;
const DB_NAME = "airline";

const client = new MongoClient(URI);

let clientPromise = client.connect();

export async function connectDB() {
  const connectedClient = await clientPromise;
  return connectedClient.db(DB_NAME);
}
