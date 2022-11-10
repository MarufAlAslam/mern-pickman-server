const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

// verify jwt token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Unauthorized!!! Access Denied');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).send('Invalid Token');
        }
        req.user = decoded;
        next();
    })
}


async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("picmanDB").collection("services");
        const blogsCollection = client.db("picmanDB").collection("blogs");
        const reviewsCollection = client.db("picmanDB").collection("reviews");

        // push data to database from client side
        app.post('/addservice', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            service.id = result.insertedId;
            console.log(`New listing created with the following id: ${result.insertedId}`);
        })


        // push reviews to database
        app.post('/addreview', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            review.id = result.insertedId;
            console.log(`New review created with the following id: ${result.insertedId}`);
        })


        // get data from database
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        // get service by id
        app.get('/servicebyid/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })


        // get all reviews
        // app.get('/reviews', async (req, res) => {
        //     const query = {}
        //     const cursor = reviewsCollection.find(query);
        //     const reviews = await cursor.toArray();
        //     res.send(reviews);
        // })


        // JSON WEB TOKEN API
        app.post('/jwt', (req, res) => {
            const user = req.body
            // console.log(user)

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10d' })
            res.json({ token })
        })



        // get reviews from database based on service id
        app.get('/reviews/:id', async (req, res) => {
            const query = { serviceId: req.params.id }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // delete a review
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            console.log(`Deleted ${result.deletedCount} item.`);
            res.send(result);
        })


        // get reviews based on reviewerEmail
        app.get('/reviews', verifyToken, async (req, res) => {
            // console.log(req.headers.authorization)
            const decoded = req.user;
            console.log(decoded)
            const query = { reviewerEmail: req.query.email }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // get data by id
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cursor = servicesCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        })




        // update review  by id
        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const newValues = { $set: { review: req.body.review, rating: req.body.rating } };
            const result = await reviewsCollection.updateOne(query, newValues);
            console.log(`${result.matchedCount} document(s) matched the query criteria.`);
            console.log(`${result.modifiedCount} document(s) was/were updated.`);
            res.send(result);
        })

        // get updated review 
        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewsCollection.findOne(query);
            res.send(review);
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