require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.REACT_APP_MONGO;

const connectmongo = ()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect(mongoURI,()=>{
        console.log("connected to database")
    })
}
module.exports=connectmongo;