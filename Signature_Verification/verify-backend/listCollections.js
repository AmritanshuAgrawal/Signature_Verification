const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose
  .connect(mongoUri , {dbName: 'signature_verification'})
  .then(async () => {
    console.log("mongodb connected");

    // List collections and their data
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (let collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      console.log(`Collection: ${collectionName}`);
      console.log(documents);
    }

    // Close the connection
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log("failed", err);
  });