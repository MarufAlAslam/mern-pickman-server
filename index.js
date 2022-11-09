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

// console.log(process.env.DB_USER);

// db details
// user picmanDB
// password Jh5sZZ1xmAiKgnKe




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wuk00kx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("picmanDB").collection("services");

        // const service = { name: "Web Development", price: 500, description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod." };
        // const result = await servicesCollection.insertOne(service);
        // console.log(`New listing created with the following id: ${result.insertedId}`);
        app.post('/addservice', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            service.id = result.insertedId;
            console.log(`New listing created with the following id: ${result.insertedId}`);
        })
    }
    finally {

    }
}

run().catch(err => console.error(err));


const blogs = [
    {
        id: 1,
        question: 'Difference between SQL and NoSQL',
        answer: 'SQL is the programming language used to interface with relational databases. (Relational databases model data as records in rows and tables with logical links between them). NoSQL is a class of DBMs that are non-relational and generally do not use SQL. NoSQL databases are often used to store large amounts of data, such as user information, and are often used in conjunction with Big Data applications. NoSQL databases are often used to store large amounts of data, such as user information, and are often used in conjunction with Big Data applications.',
    },
    {
        id: 2,
        question: 'What is JWT, and how does it work?',
        answer: 'JSON Web Token (JWT) is a compact URL-safe means of representing claims to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is digitally signed using JSON Web Signature (JWS). JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.',
    },
    {
        id: 3,
        question: 'What is the difference between javascript and NodeJS?',
        answer: 'JavaScript is a scripting language that runs in the browser. Node.js is a JavaScript runtime built on Chrome’s V8 JavaScript engine. Node.js is an event-based, non-blocking, asynchronous I/O runtime that uses Google’s V8 JavaScript engine and libuv library.',
    },
    {
        id: 4,
        question: 'How does NodeJS handle multiple requests at the same time?',
        answer: 'Node.js is a single-threaded application, but it can support concurrency via the concept of event and callbacks. Every API of Node.js is asynchronous and being single-threaded, they use async function calls to maintain concurrency. Node uses observer pattern. Node thread keeps an event loop and whenever a task gets completed, it fires the corresponding event which signals the event-listener function to execute.',
    },
]


app.get('/blogs', (req, res) => {
    res.send(blogs);
});


app.get('/', (req, res) => {
    res.send('PicMan Server is Running');
});

const services = []



app.get('/services', (req, res) => {
    res.send(services);
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});