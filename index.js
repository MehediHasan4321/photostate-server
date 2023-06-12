const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_PAYMENTS_SECRECT)

//Meddleware

app.use(cors())
app.use(express.json())

const verifyJwtToken = (req, res, next) => {
  const authorization = req.headers.authorization
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthrize token' })
  }
  const token = authorization.split(" ")[1]
 

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(403).send({ error: true, message: 'unauthrize token' })
    }

    req.decoded = decoded
    next()
  })
}

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
const courseOrderCollection = client.db('photostatDB').collection('courseOrders')
const paymentCollection = client.db('photostatDB').collection('paymentsDB')

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();


    app.post('/jwt', (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN, { expiresIn: '1h' })
      res.send({ token })
    })




    // All Get Methods Are Here


    app.get('/users', verifyJwtToken, async (req, res) => {
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
    app.get('/coursesStatus/:status', async (req, res) => {
      const status = req.params.status
      const query = { status: status }
      const result = await courseCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/instractorCourse/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await courseCollection.find(query).toArray()
      const aprove = result.filter(item=>item.status === 'aprove')
      res.send(aprove)
    })
    app.get('/instractor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await userCollection.findOne(query)
      res.send(result)
    })
    app.get('/user/role/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await userCollection.findOne(query)
      res.send(result)
    })
    app.get('/users/:role', async (req, res) => {
      const role = req.params.role
      const query = { role: role }
      const result = await userCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/enrolledStudent',verifyJwtToken, async (req, res) => {
      const emails = req.query.emails
      const query = { email: { $in: emails?.split(",") } };
      const result = await userCollection.find(query).toArray()
      res.send(result)

    })
    app.get('/courseOrder',verifyJwtToken, async (req, res) => {
      const status = req.query.status
      const query = { status: status }
      const result = await courseOrderCollection.find().toArray()
      res.send(result)
    })

    app.get('/courseOrder/:email',verifyJwtToken, async (req, res) => {
      const email = req.params.email;
      const status = req.query.status
      const query = { email: email }
      const result = await courseOrderCollection.find(query).toArray()
      const filterResult = result.filter(item => item.orderStatus === status)
      if (status) {
        res.send(filterResult)
      } else {
        res.send(result)
      }
    })

    app.get('/courseOrderById/:id',verifyJwtToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await courseOrderCollection.findOne(query)
      res.send(result)
    })


    app.get('/allPayments',verifyJwtToken, async (req, res) => {
      const email = req.query.email
      const resutl = await paymentCollection.find().sort({ data: -1 }).toArray()
      const filterResult = resutl.filter(item => item.studentEmail === email)
      if (email) {
        res.send(filterResult)
      } else {
        res.send(resutl)
      }

    })

    //All Post Methods Are Here

    app.post('/courses', async (req, res) => {
      const course = req.body;
      const result = await courseCollection.insertOne(course)
      res.send(result)
    })

    app.post('/courseOrder', async (req, res) => {
      const order = req.body;
      const result = await courseOrderCollection.insertOne(order)

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


    app.put('/courses/:id', async (req, res) => {
      const id = req.params.id
      const update = req.body;
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateCourse = {
        $set: update
      }
      const result = await courseCollection.updateOne(query, updateCourse, options)
      res.send(result)

    })
    app.put('/updateOrder/:id', async (req, res) => {
      const id = req.params.id
      const update = req.body;
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: update
      }
      const result = await courseOrderCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })

    app.put('/updateUserRole/:email', async (req, res) => {
      const email = req.params.email;
      const role = req.body
      const query = { email: email }
      const options = { update: true }
      const update = { $set: { role } }
      const result = await userCollection.updateOne(query, update, options)
      res.send(result)
    })

    app.post("/create-payment-intent", verifyJwtToken, async (req, res) => {
      const { price } = req.body
      const payable = parseInt(price * 100)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: payable,
        currency: "usd",
        payment_method_types: ['card'],
      })
      res.send({ clientSecret: paymentIntent.client_secret })
    })

    app.post('/payment', async (req, res) => {
      const history = req.body
      const result = await paymentCollection.insertOne(history)
      res.send(result)
    })
    //All DELETE Methods Are Here

    app.delete('/courses/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await courseCollection.deleteOne(query)
      res.send(result)
    })

    app.delete('/deleteOrder/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await courseOrderCollection.deleteOne(query)
      res.send(result)

    })

    app.delete('/paymentHistory/:id', async(req,res)=>{
      const id = req.params.id
      const query = {_id:new ObjectId(id)}
      const result = await paymentCollection.deleteOne(query)
      res.send(result)
    })



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

