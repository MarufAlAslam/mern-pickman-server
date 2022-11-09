const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.port || 5000;


// use cors
const cors = require('cors');

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wuk00kx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("picmanDB").collection("services");
        const blogsCollection = client.db("picmanDB").collection("blogs");

        // push data to database from client side
        app.post('/addservice', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            service.id = result.insertedId;
            console.log(`New listing created with the following id: ${result.insertedId}`);
        })


        // get data from database
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        // get 3 data from database
        // get data from database in reverse order

        // app.get('/services3', async (req, res) => {
        //     const query = {}
        //     const cursor = servicesCollection.find(query).sort({ _id: -1 }).limit(3);


        app.get('/top', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query);
            const services = await cursor.limit(3).sort({ _id: -1 }).toArray();
            res.send(services);
        })


        // get blogs from database
        app.get('/blogs', async (req, res) => {
            const query = {}
            const cursor = blogsCollection.find(query);
            const blogs = await cursor.toArray();
            res.send(blogs);
        })
    }
    finally {

    }
}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('PicMan Server is Running');
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});