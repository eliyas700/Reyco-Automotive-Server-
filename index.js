const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { decode } = require("jsonwebtoken");
const port = process.env.PORT || 5000;
//MiddleWare
app.use(cors());
app.use(express.json());

//Mongodb Connect
const uri = `mongodb+srv://${process.env.MY_USER}:${process.env.MY_PASSWORD}@cluster0.wu2yr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access!" });
  }
  //get the token from Auth header by Spliting
  const token = authHeader.split(" ")[1];
  //Verify Token (If it is Correct or not)
  jwt.verify(token, process.env.MY_ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      // if Token is not Correct
      return res.status(403).send({ message: "Forbidden Access" });
    }
    //If token is Right
    req.decoded = decoded;
    console.log(decoded); // bar
    next();
  });
};
async function run() {
  try {
    await client.connect();
    const productsCollection = client
      .db("reyco-automotive")
      .collection("products");
    const usersCollection = client.db("reyco-automotive").collection("users");
    const ordersCollection = client.db("reyco-automotive").collection("orders");
    const reviewsCollection = client
      .db("reyco-automotive")
      .collection("reviews");

    //Check Whether the user Was Previously logged in or Not
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      //If the user is not existed it will add
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign({ email: email }, process.env.MY_ACCESS_TOKEN, {
        expiresIn: "15d",
      });
      res.send({ result, token });
    });

    //Get All Reviews From DB
    //Get All The Products
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //Get All The Products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    //Load a Specific Product Detail
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });
    //Add a Order
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const query = {
        name: order.name,
        userEmail: order.userEmail,
      };
      const exists = await ordersCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, order: exists });
      }
      const result = await ordersCollection.insertOne(order);
      return res.send({ success: true, result });
    });

    //Get All the orders for a Specific User
    app.get("/orders", verifyJWT, async (req, res) => {
      //Requested Email
      const userEmail = req.query.userEmail;
      console.log(userEmail);
      // const authorization = req.headers.authorization;
      // console.log(authorization);
      // Give the information's to the Exact(Right) user,Dont give other Users Info
      const decodedEmail = req.decoded.email;
      if (userEmail === decodedEmail) {
        const query = { userEmail: userEmail };
        const orders = await ordersCollection.find(query).toArray();
        res.send(orders);
      } else {
        return res
          .status(403)
          .send({ message: "Forbidden Access! you aren't the right user" });
      }
    });
    //Update Specific Product after Payment
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      console.log(updateProduct.Quantity);
      const updateDoc = {
        $set: {
          available: updateProduct.Quantity,
          totalSell: updateProduct.Sale,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!This is from Reyco Automotive");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
