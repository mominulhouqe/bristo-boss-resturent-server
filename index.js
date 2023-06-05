const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

app.get("/", (req, res) => {
  res.send("Bristo boss is running!"); // Root endpoint response
});

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.34btmna.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the MongoDB server
    // await client.connect();

    // bristo boss menu collection
    const bristoBossCollection = client.db("bristoBoss").collection("menu");

    // Bristo boss review collection
    const bristoBossReviewCollection = client
      .db("bristoBoss")
      .collection("reviews");

    // cart collection apis
    const cartCollection = client.db("bristoBoss").collection("carts");

    // users collection apis
    const userCollection = client.db("bristoBoss").collection("users");

    // JWT token generation endpoint
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
      res.send({ token });
    });

    // Users related APIs
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const users = req.body;
      console.log(users);
      const query = { email: users.email };
      const existingUser = await userCollection.findOne(query);
      console.log("existing user", existingUser);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }

      const results = await userCollection.insertOne(users);
      res.send(results);
    });

    // Make user an admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Menu items APIs
    app.get("/menu", async (req, res) => {
      const cursor = bristoBossCollection.find();
      const results = await cursor.toArray();
      res.send(results);
    });

    // Reviews items APIs
    app.get("/reviews", async (req, res) => {
      const results = await bristoBossReviewCollection.find().toArray();
      res.send(results);
    });

    // Cart collection APIs
    app.get("/carts", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const items = req.body;

      const results = await cartCollection.insertOne(items);
      res.send(results);
    });

    // Delete cart operation
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const results = await cartCollection.deleteOne(query);
      res.send(results);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Close the MongoDB client when finished or an error occurs
    await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`BRISTRO boss is running on port ${port}`);
});
