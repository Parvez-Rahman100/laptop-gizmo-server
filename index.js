const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@laptopgizmo.k2j6o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run (){
    try{
        await client.connect();
        const partsCollection = client.db('laptopGizmo').collection('parts');
        const odersCollection = client.db('laptopGizmo').collection('orders');
        


        app.get('/parts',async(req,res)=>{
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        app.get('/parts/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const parts = await partsCollection.findOne(query);
            res.send(parts);
        })


        app.post('/order',async(req,res)=>{
              const order = req.body;
              const query = {name : order.name , orderId : order.orderId};
              const exist =  await odersCollection.findOne(query);
              if(exist){
                  return res.send({success : false , order : exist})
              }
              const result = await odersCollection.insertOne(order);
              return res.send({success : true, result})
        })
    }
    finally{

    }
}
run().catch(console.dir);





app.get('/', (req,res)=>{
    res.send('running')
})



app.listen(port,()=>{
    console.log('listenning to port', port);
})