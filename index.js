const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jsonwebtoken = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@laptopgizmo.k2j6o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWt(req,res,next){

    const authHeader =req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message : 'Unauthorized access'})
    }
    const token = authHeader.split(' ')[1]; 
    jsonwebtoken.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decode){
        if(err){
            return res.status(403).send({message : 'Forbidden Access'})
        }
        req.decode = decode;
        next()
    })
}


async function run (){
    try{
        await client.connect();
        const partsCollection = client.db('laptopGizmo').collection('parts');
        const odersCollection = client.db('laptopGizmo').collection('orders');
        const reviewsCollection = client.db('laptopGizmo').collection('reviews')
        const usersCollection = client.db('laptopGizmo').collection('users')
        


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
              const query = {email : order.email, orderId : order.orderId};
              const exist =  await odersCollection.findOne(query);
              if(exist){
                  return res.send({success : false , order : exist})
              }
              const result = await odersCollection.insertOne(order);
              console.log(result);
              return res.send({success : true, result})
        });


        app.get('/order',verifyJWt, async(req,res)=>{
            const email = req.query.email;
                const query = {email : email} ;
            const orders = await odersCollection.find(query).toArray(); 
            return res.send(orders)
            });

            app.get('/users',verifyJWt, async(req,res)=>{
                const users = await usersCollection.find().toArray()
                res.send(users);
            })


        app.post('/reviews',async(req,res)=>{
            const reviews = req.body;
            const query = { email : reviews.email, productName : reviews.productName};
            const exist =  await reviewsCollection.findOne(query);
            if(exist){
                return res.send({success : false , order : exist})
            }
            const result = await reviewsCollection.insertOne(reviews);
            return res.send({success : true, result})
      });

      app.get('/reviews',async(req,res)=>{
        const query = {};
        const cursor = reviewsCollection.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
    });

    app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        const token = jsonwebtoken.sign({email : email}, process.env.ACCESS_TOKEN_SECRET)
        res.send({ result , token}  );
      });


      app.put('/user/admin/:email', async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = {
          $set: {role : 'admin'},
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result  );
      });



        
        
        
        
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