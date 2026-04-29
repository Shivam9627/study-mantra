import mongoose from "mongoose";

const defaultLocalUri = "mongodb://127.0.0.1:27017/studymantra";

const normalizeMongoUri = (input) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  let uri = input.trim();
  const isAtlas = uri.startsWith("mongodb+srv://");

  // If only the cluster host is present, append the database name.
  if (uri && !/mongodb(\+srv)?:\/\/[^\/]+\/?[^?]/.test(uri)) {
    uri = `${uri}/studymantra`;
  }

  if (isAtlas && !uri.includes("?")) {
    uri = `${uri}?retryWrites=true&w=majority`;
  } else if (isAtlas && !/[?&]retryWrites=/.test(uri)) {
    uri = `${uri}&retryWrites=true&w=majority`;
  }

  return uri;
};

const connectDB = async () => {
  const envUri = normalizeMongoUri(process.env.MONGO_URI);
  const localUri = normalizeMongoUri(
    process.env.MONGO_URI_LOCAL || process.env.LOCAL_MONGO_URI || defaultLocalUri
  );
  const uri = envUri || localUri;
  const usingAtlas = uri.startsWith("mongodb+srv://");

  const options = {
    serverSelectionTimeoutMS: 10000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);

    if (usingAtlas && /querySrv|ENOTFOUND|ETIMEOUT|ECONNREFUSED/i.test(error.message)) {
      console.warn(
        "Atlas DNS lookup failed on this network. Trying local MongoDB at mongodb://127.0.0.1:27017/studymantra"
      );
    }

    if (localUri && uri !== localUri) {
      console.warn("Attempting local MongoDB fallback because the primary connection failed.");
      try {
        const conn = await mongoose.connect(localUri, options);
        console.log(`MongoDB Connected (local fallback): ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error("Local MongoDB fallback failed:", fallbackError.message);
      }
    }

    console.error(
      "Unable to connect to MongoDB. If you are using Atlas, verify your URI includes the database name and options."
    );
    console.error(
      "Example: mongodb+srv://<username>:<password>@cluster0.lgsswc7.mongodb.net/studymantra?retryWrites=true&w=majority"
    );
    console.error(
      "If Atlas DNS is blocked on your network, install/start local MongoDB or set MONGO_URI_LOCAL."
    );
    process.exit(1);
  }
};

export default connectDB;
