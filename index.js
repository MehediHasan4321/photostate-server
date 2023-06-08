const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000
const app = express()


//Meddleware

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://photostat:FprzsuRcDBRS2bC2@cluster0.mzevrg2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const userCollection = client.db('photostatDB').collection('usersDB')
const courseCollection = client.db('photostatDB').collection('coursesDB')


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //All Get Methods Are Here
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })


    app.get('/courses', async (req, res) => {
      const result = await courseCollection.find().toArray()
      res.send(result)
    })

    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await courseCollection.findOne(query)
      res.send(result)
    })

    app.get('/instractor/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email:email}
      const result = await courseCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/user/role/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email: email}
      const result = await userCollection.findOne(query)
      res.send(result)
    })
    app.get('/users/:role',async(req,res)=>{
      const role = req.params.role
      const query = {role:role}
      const result = await userCollection.find(query).toArray()
      res.send(result)
    })
    //All Post Methods Are Here

    app.post('/courses', async (req, res) => {
      const course = req.body;
      const result = await courseCollection.insertOne(course)
      res.send(result)
    })

    //All PUT Methods Are Here
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body;
      const query = { email: email }
      const options = { upsert: true }
      const update = {
        $set: user
      }

      const result = await userCollection.updateOne(query, update, options)
      res.send(result)
    })

    //All DELETE Methods Are Here





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Photostat successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Photostat is running')
})

app.listen(port, () => {
  console.log(`photostat in running on port ${port}`)
})

