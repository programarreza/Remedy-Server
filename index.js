const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
// const axios = require('axios')
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_BD}:${process.env.PASS_DB}@cluster0.2vmdteo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const blogCollection = client.db("blogDB").collection("blog");
const wishlistCollection = client.db("wishlistDB").collection("wishlist");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    // blog
    app.post("/blog", async (req, res) => {
      const blog = req.body;
      console.log(blog);
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    // all blog
    app.get("/blog", async(req, res) => {
      let query = {};
      const category = req.query.category;
      if(category){
        query.category = category;
      }

      const cursor = await blogCollection.find(query).toArray()
      res.send(cursor)
    })

    // recent recent blog
    app.get("/recent-blog", async (req, res) => {
      const sortBlog = await blogCollection
        .find()
        .sort({ currentDate: -1 })
        .limit(6)
        .toArray();
      res.send(sortBlog);
    });

    app.get("/blog-details/:id", async(req, res) => {
      const id = req.params.id;
      console.log( id);
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
	  console.log(result);
      res.send(result);
    });


	// wishlist
	app.post('/add-wishlist', async(req, res) => {
		const wishlist = req.body;
		console.log(wishlist);
		const result = await wishlistCollection.insertOne(wishlist)
		res.send(result)
	})

	app.get('/add-wishlist', async(req, res) => {
		let query = {};
		if(req.query?.email){
			query = {email: req.query.email}
		}
		const result = await wishlistCollection.find(query).toArray();
		res.send(result);
	})

  app.delete('/delete-wishlist/:id', async(req, res) => {
    const id = req.params.id;
    console.log(id);
    const query = {_id: new ObjectId(id)};
    const result = await wishlistCollection.deleteOne(query);
    res.send(result);
  })

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

app.get("/", (req, res) => {
  res.send("remedy blog server is running");
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
