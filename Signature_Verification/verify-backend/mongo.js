import { connect, Schema, model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const mongoUri = process.env.MONGODB_URI;

// Connect to MongoDB
connect(mongoUri, { dbName: "signature_verification" })
  .then(() => {
    console.log("Connection has been established with MongoDB successfully!");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

// Define schema and model
const newSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },
});

const Admin = model("Admin", newSchema);

export default Admin;
