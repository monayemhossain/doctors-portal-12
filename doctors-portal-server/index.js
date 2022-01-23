const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const { application } = require("express");

const port = process.env.PORT || 5000;
// middle ware
app.use(cors());
app.use(express.json());

// Mongodb connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zighg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("doctors_portal");
    const appointmentsCollection = database.collection("appointments");
    const usersCollection = database.collection("users");

    // get method
    app.get("/appointments", async(req, res) => {
      const email= req.query.email;
      const date = new Date(req.query.date).toLocaleDateString();
     
      const query= {email:email,date:date};
      const cursor = appointmentsCollection.find(query);
      const appointments = await cursor.toArray();
      res.json(appointments);
    });

    //  appointments post method
    app.post("/appointments", async(req, res) => {
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      res.json(result);
    });

    // users post method

    app.post("/users", async(req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    }); 

      // upsert user data
    app.put("/users", async(req, res) => {
      const user = req.body;
     const filter ={ email: user.email };
     // this option instructs the method to create a document if no documents match the filter
    const options = { upsert: true };
    const updateDoc = {
      $set: {user}
    };

    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result)
    
    });

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(` Server  listening at http://localhost:${port}`);
});
