const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const shortid = require('shortid');
const mongoose = require('mongoose');
const {v4 : uuidv4} = require('uuid')
let bodyParser=require("body-parser");
const { query } = require('express');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const userSchema = new Schema({
     username:  String,
 
});
const exerciseSchema = new Schema({
  username:  String,
  description: String,
  duration: Number,
  date : Date,
  
});
const logSchema = new Schema({
  username:  String,
  count: Number,
  
  log: Array,

});
const User = mongoose.model('User',userSchema);
const Exercise = mongoose.model('Exercise',exerciseSchema );
const Log = mongoose.model("Log",logSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post("/api/users",(req,res)=>{
 
    const{username} = req.body;
   
    let findUser = User.findOne({username:username},(err,data)=>{
      if(err){
        console.log("error")
      }else{
      if(!data){
         findUser = new User({username:username,"_id":req.body._id })
         findUser.save((err,data)=>{
             if(err){
               console.log("error")
             }else{
              res.json({ "username":data.username,
              "_id":data._id
            })
             }
         })
        
        }
    }
    })
 
    
})


app.post("/api/users/:_id/exercises",(req,res)=>{
  let id = req.params._id;
  // let userid = id.id
  const{description,duration}= req.body;
  let datenow = new Date(req.body.date);

  let noDate = ()=> {
    if(datenow instanceof Date && !isNaN(datenow)){
        return datenow
      }else{
         datenow = new Date();
         return datenow
     
      }
    
  }
  User.findById(id,(err,data)=>{
   
    noDate(datenow);
    
    if(err){
      console.log("error")
    }else{
      
       let exer = new Exercise({username:data.username,duration:duration,description:description,
        date:datenow.toDateString()})
        
         exer.save((err,data)=>{
     
           if(err){
             console.log("error")
           }else{
            res.json({"username":data.username,
            "description":data.description,"duration":data.duration,
            "date":datenow.toDateString(),"_id":id, 
          })
           }
       })
      
    }
  })
});

app.get("/api/users/:_id/logs",(req,res)=> {
  const {from,to,limit}=req.query;
   let id = req.params._id;
   User.findById(id,(err,data)=>{
     let query = {username:data.username};
     if(from !== undefined && to === undefined){
         query.date ={$gte: new Date(from)}
     }else if (to !== undefined && from ===undefined){
     query.date ={$lte: new Date(to)}
   }else if (from !== undefined && to !==undefined){
     query.date = {$gte: new Date(from),$lte: new Date(to)}
   } 

   let checkLimit =(limit)=>{
     let maxLimit =100;
     if(limit){
       return limit
     }else{
       return maxLimit
     }
   }
   if(err){
     console.log("err")
   }else{
     Exercise.find((query),null,{limit:checkLimit(+limit)},(err,data)=>{
      let logArray =[];
      console.log("ddda",data)
      if(err){
         console.log("err")
       }else{
         logArray=data.map((item)=>{
           console.log("item",item.date)
           console.log("ff",item.date.toDateString())
           return {
            description:item.description,
            duration: item.duration,
            date:item.date.toDateString(),
           }
         })
         const logsinfo= new Log({
           username:data.username,
           count:logArray.length,
           log:logArray,
         })
         logsinfo.save((err,data)=>{
           if(err){
             console.log("err")
           }else{
             res.json({id:id,username:data.username,count:data.count,log:logArray})
           }
         })
        
       }
     })
   }

})
});
app.get("/api/users",(req,res)=> {
  User.find({},(err,data)=>{
    if(err){
      console.log("err")
    }else{
      res.json(data)
    }
  })

});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
