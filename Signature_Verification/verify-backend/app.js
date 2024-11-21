import express from "express";
import cors from "cors";
import collection from "./mongo.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health check
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Login route
app.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const check = await collection.findOne({ email });
    if (check) {
      return res.json("exist");
    } else {
      return res.json("notexist");
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.json("fail");
  }
});

// Signup route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const check = await collection.findOne({ email });

    if (check) {
      return res.json("exist");
    } else {
      const newUser = new collection({ email, password });
      await newUser.save();
      return res.json("notexist");
    }
  } catch (error) {
    console.error("Error during signup:", error);
    return res.json("fail");
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
