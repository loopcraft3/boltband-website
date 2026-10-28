const mongoose = require("mongoose");

// Cache the connection so serverless invocations on Vercel reuse it.
let cached = global._mongo || (global._mongo = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  cached.promise ||= mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
