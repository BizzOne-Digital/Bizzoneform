import { MongoClient, ObjectId } from "mongodb";

declare global { var _mongoClientPromise: Promise<MongoClient> | undefined; }

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }
  return new MongoClient(uri).connect();
}

export { ObjectId };

export async function getDb() {
  const client = await getClientPromise();
  return client.db("bizzone");
}

export async function getSubmissions() {
  const db = await getDb();
  return db.collection("submissions");
}