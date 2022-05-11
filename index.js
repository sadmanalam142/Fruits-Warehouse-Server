const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cqcdf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitCollection = client.db("fruitsWarehouse").collection("fruits");

        // auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '10d'
            });
            res.send({accessToken})
        })
        // auth

        app.get('/fruits', async (req, res) => {
            const email = req.query.email;
            if (email) {
                const query = { email: email };
                const cursor = fruitCollection.find(query);
                const items = await cursor.toArray();
                res.send(items)
            }
            else {
                const query = {};
                const cursor = fruitCollection.find(query);
                const result = await cursor.toArray();
                res.send(result)
            }
        });

        app.get('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.findOne(query);
            res.send(result)
        });

        app.post('/fruits', async (req, res) => {
            const newItem = req.body;
            const result = await fruitCollection.insertOne(newItem);
            res.send(result)
        })

        app.put('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedQuantity.quantity
                }
            };
            const result = await fruitCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.delete('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.deleteOne(query);
            res.send(result)
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('i am running node')
})

app.listen(port, () => {
    console.log('successfuly listening', port)
})