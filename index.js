const express = require('express');
const app = express();
var cors = require('cors')
require('dotenv').config();
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017"; 
const port = process.env.PORT || 5304;

app.use(express.json());
app.use(cors())

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
        sendMail(req.body.email, 'SignUP/Login Registraion', 'You have been registered successfully.');
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
            sendMail(req.body.email, 'SignUP/Login Login', 'You have been logged in successfully.');   
        }
         else{
            return res.status(400).json({messsage:"Login unsuccessfull"});    
          }
        }
         else{
            return res.send(404).json({messsage:"User is not registered"});
          
      }
      clientInfo.close();
      }
      catch(e){
         console.log(e);
      }
})

   async function sendMail(_email,_subject,_text){
       console.log(_email,_subject,_text);
       let mailTrasporter = nodemailer.createTransport({
           service: 'gmail',
           auth: {
               user:'shubhganeshan@gmail.com',
               pass:'bytxnbanvbapmdln'
           }
       });

       let mailDetails = {
           from: 'shubhganeshan@gmail.com',
           to: _email,
           subject: _subject,
           text: _text
       };

       mailTrasporter.sendMail(mailDetails,function (err,data){
           if(err){
               console.log(err);
           }
           else{
            console.log("Email sent successfully.");
           }
       })
   }

app.listen(port,()=>{console.log("server is listening on "+port)});