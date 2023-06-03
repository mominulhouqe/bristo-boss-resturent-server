const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bristo boss is running!");
});

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

// bristoo boss menu collection
    const bristoBossCollection = client.db("bristoBoss").collection("menu");
    // Bristo boss review collection
    const bristoBossReviewCollection = client
      .db("bristoBoss")
      .collection("reviews");

    // cart collection apis
    const cartCollection = client.db("bristoBoss").collection("carts");

    // users collection apis
    const userCollection = client.db("bristoBoss").collection("users");

// users releted apis
app.get('/users', async(req, res ) => {
  const result = await userCollection.find().toArray();

  res.send(result)

})



    app.post('/users', async(req, res) => {
      const users = req.body;
      console.log(users)
      const query = {email: users.email}
      const exsitingUser = await userCollection.findOne(query);
      console.log("exsiting user",exsitingUser);
      if(exsitingUser){
        return res.send({message : 'user already exists'})
      }

      const results = await userCollection.insertOne(users);
      res.send(results)
    })






    // menu items apis
    app.get("/menu", async (req, res) => {
      const cursor = bristoBossCollection.find();
      const results = await cursor.toArray();
      res.send(results);
    });


    // reviews items apis
    app.get("/reviews", async (req, res) => {
      const results = await bristoBossReviewCollection.find().toArray();
      res.send(results);
    });



    // cart collectionn  apis
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

    //Deleted Cart operation
    app.delete('/carts/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      console.log(query);
      const results = await cartCollection.deleteOne(query)
      res.send(results)
      
    }) 




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`BRISRO boss is running on port ${port}`);
});
