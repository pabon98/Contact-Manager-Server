const express = require('express')
const cors = require('cors')
const app = express()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = process.env.PORT || 5000

//middle wire
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lzm3u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect()
       const database = client.db('contactsdb')
       const contactsCollection = database.collection('contacts')

        //GET API for finding all contacts
        app.get('/contacts/:email', async(req,res)=>{
            const email = req.params.email
            const cursor = contactsCollection.find({RegisteredUser: email})
            const contacts = await cursor.toArray()
            res.send(contacts)
        })
        //GET API for finding one contact for updating
        app.get('/contacts/:id', async(req,res)=>{
          const id = req.params.id
          const query = {_id: ObjectId(id)}
          const contact = await contactsCollection.findOne(query)
          console.log('getting contacts',id);
          res.send(contact)
        })
        //POST method for posting users into database
        app.post('/contacts', async(req,res)=>{
            const newContact = req.body
            const result = await contactsCollection.insertOne(newContact)
            console.log('got new contact', req.body);
            // console.log('added contact', result);
            res.json(result)
        })

        //PUT method for update products into database
        app.put('/contacts/:id', async(req,res)=>{
          const id = req.params.id
          const updatedContact = req.body
          const filter = {_id: ObjectId(id)}
          const options = { upsert: true };
          const updatedDoc ={
            $set:{
              name: updatedContact.name,
              number: updatedContact.number,
            },
          };
          const result = await contactsCollection.updateOne(filter, updatedDoc,options )
          console.log('Updating contact', id);
          console.log(result);
          res.json(result)
        })
        //DELETE API for delete users
      app.delete('/contacts/:id', async(req,res)=>{
       const id = req.params.id
       const query ={_id: ObjectId(id)}
       const result = await contactsCollection.deleteOne(query)
       console.log(result);
       res.send(result)
      })
    }
    finally {
        // await client.close();
      }
    }
    run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('Hello Contacts server')
})

app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
}) 


