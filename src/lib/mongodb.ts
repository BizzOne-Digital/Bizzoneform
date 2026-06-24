import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global { var _mongoClientPromise: Promise<MongoClient> | undefined; }

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
export { ObjectId };

export async function getDb() {
  const c = await clientPromise;
  return c.db("bizzone");
}

export async function getSubmissions() {
  const db = await getDb();
  return db.collection("submissions");
}