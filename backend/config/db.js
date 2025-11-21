import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If no explicit database path provided, append a default database name
    if (uri && !/mongodb(\+srv)?:\/\/[^\/]+\/[^?]/.test(uri)) {
      uri = `${uri}/studymantra`;
    }

    const conn = await mongoose.connect(uri, {
      // options are optional; mongoose 7 uses good defaults
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
