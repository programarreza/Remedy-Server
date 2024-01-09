const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_BD}:${process.env.PASS_DB}@cluster0.2vmdteo.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const blogCollection = client.db("blogDB").collection("blog");
const wishlistCollection = client.db("wishlistDB").collection("wishlist");
const commentCollection = client.db("commentDB").collection("comment");

async function run() {
  try {
    await client.connect();

    // blog
    app.post("/blog", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    // all blog
    app.get("/blog", async (req, res) => {
      // let query = {};
      // const category = req.query.category;
      // if (category) {
      //   query.category = category;
      // }
      // const cursor = await blogCollection.find(query).toArray();
      // res.send(cursor);
      const queryObj = {};

      const category = req.query.category;
      const title = req.query.title;

      if (category) {
        queryObj.category = { $regex: new RegExp(category) };
      }
      if (title) {
        queryObj.title = { $regex: new RegExp(title, "i") };
      }

      const cursor = await blogCollection.find(queryObj).toArray();
      res.send(cursor);
    });

    // recent recent blog
    app.get("/recent-blog", async (req, res) => {
      const sortBlog = await blogCollection
        .find()
        .sort({ currentDate: -1 })
        .limit(6)
        .toArray();
      res.send(sortBlog);
    });

    // top blog
    app.get("/top-blog", async (req, res) => {
      const topBlogs = await blogCollection
        .aggregate([
          {
            $project: {
              title: 1,
              userName: 1,
              userProfile: 1,
              longDescription: 1,
              wordCount: { $size: { $split: ["$longDescription", " "] } },
            },
          },
          { $sort: { wordCount: -1 } },
          { $limit: 10 },
        ])
        .toArray();

      // Extracting only the necessary data for response
      const simplifiedTopBlogs = topBlogs.map((blog) => ({
        title: blog.title,
        userName: blog.userName,
        userProfile: blog.userProfile,
        longDescription: blog.longDescription,
        wordCount: blog.wordCount,
      }));

      res.send(simplifiedTopBlogs);
    });

    app.get("/blog-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });

    app.get("/blog-update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });

    // update blog
    app.put("/blog-update/:id", async (req, res) => {
      const id = req.params.id;
      const updateBlog = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const blog = {
        $set: {
          title: updateBlog.title,
          image: updateBlog.image,
          category: updateBlog.category,
          shortDescription: updateBlog.shortDescription,
          longDescription: updateBlog.longDescription,
        },
      };
      const result = await blogCollection.updateOne(filter, blog, options);
      res.send(result);
    });

    // wishlist
    app.post("/add-wishlist", async (req, res) => {
      const wishlist = req.body;
      const result = await wishlistCollection.insertOne(wishlist);
      res.send(result);
    });

    app.get("/add-wishlist", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await wishlistCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/delete-wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    });

    // comment api
    app.post("/comment", async (req, res) => {
      const comment = req.body;
      const result = await commentCollection.insertOne(comment);
      res.send(result);
    });

    app.get("/comment", async (req, res) => {
      let query = {};
      if (req.query?.blog_id) {
        query = { blog_id: req.query.blog_id };
      }
      const result = await commentCollection.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
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
