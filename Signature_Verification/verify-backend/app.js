import express from "express";
import cors from "cors";
import collection from "./mongo.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const SECRET_KEY = "SECRET"; // Replace with a strong secret key

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT middleware for protected routes (if needed in future)
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access Denied");

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send("Invalid Token");
    req.user = user;
    next();
  });
};

// Login Route
app.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await collection.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ email: user.email }, SECRET_KEY, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await collection.findOne({ email: email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new collection({ email: email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});