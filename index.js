const express = require('express');
const app = express();
require('dotenv').config();
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;
const bcrypt = require('bcrypt');
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017"; 
const port = process.env.PORT || 5011;

app.use(express.json());

app.post('/register',async (req,res)=>{
    try{
      let clientInfo = await mongoClient.connect(dbUrl);
      let db = clientInfo.db("credentials");
      let found =await db.collection("users").findOne({email:req.body.email});
      if(found){
        res.status(400).json({message:"User already exists."})
      }else{
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password,salt);
        req.body.password = hash; 
        await db.collection('users').insertOne(req.body);
        res.status(200).json({message:"User is created"}); 
      }
      clientInfo.close();
    }   
    catch(e){
        console.log(e);
    }
})

app.post("/login",async (req,res)=>{
      try{
      let clientInfo = await mongoClient.connect(dbUrl);
      let db = clientInfo.db("credentials");
      let found = await db.collection('users').findOne({email: req.body.email});
      if(found){
       let verify = await bcrypt.compare(req.body.password,found.password);
       if(verify){
           res.status(200).json({messsage:"Login Successfull"});
       }
       else{
        res.status(400).json({messsage:"Login unsuccessfull"});
       }
      }
      else{
          res.send(404).json({messsage:"User is not registered"});
      }
      }
      catch(e){
         console.log(e);
      }
})

app.listen(port,()=>{console.log("server is listening on "+port)});