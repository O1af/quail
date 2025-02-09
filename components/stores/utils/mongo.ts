import { MongoClient, Db, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "quail";

const options: MongoClientOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  maxPoolSize: 50,
};

class MongoDB {
  private static instance: MongoDB;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private readonly IDLE_TIME = 1000 * 60 * 30; // 30 minutes

  private constructor() {}

  static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  async connect(): Promise<void> {
    if (!this.client) {
      try {
        this.client = new MongoClient(uri, options);
        await this.client.connect();
        this.db = this.client.db(dbName);
        this.resetConnectionTimeout();
        console.log("Connected to MongoDB");
      } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
      }
    }
    this.resetConnectionTimeout();
  }

  private resetConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }
    this.connectionTimeout = setTimeout(async () => {
      console.log("Closing idle MongoDB connection");
      this.connectionTimeout = null;
      await this.close();
    }, this.IDLE_TIME);
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error("Database not initialized. Call connect() first.");
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("MongoDB connection closed");
    }
  }
}

// Export singleton instance methods
export const connectToMongo = () => MongoDB.getInstance().connect();
export const getDatabase = () => MongoDB.getInstance().getDb();
export const closeMongoDB = () => MongoDB.getInstance().close();

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeMongoDB();
  process.exit(0);
});
