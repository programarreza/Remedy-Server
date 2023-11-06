const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
// const axios = require('axios')
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_BD}:${process.env.PASS_DB}@cluster0.2vmdteo.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
},
});
const blogCollection = client.db('blogDB').collection('blog')

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection


	// blog 
	app.post('/blog', async(req, res) => {
		const blog = req.body;
		console.log(blog);
		const result = await blogCollection.insertOne(blog)
		res.send(result);
	})

	// recent blog 
	app.get('/recent-blog', async(req, res) => {
		const sortBlog = await blogCollection.find().sort({currentDate: -1 }).limit(6).toArray();
		res.send(sortBlog)
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
