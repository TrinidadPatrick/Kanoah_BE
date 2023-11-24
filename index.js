const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const Route = require('./Routes/Routes')
// const tempServiceRoute = require('./Routes/ServiceRoute')

app.use(express.json())
app.use(cors())
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database Connected")
}).catch((err)=>{
    console.log(err)
})

app.use("/api", Route) //For User Table




app.listen(process.env.PORT, ()=>{
    console.log("App listening at port: " + process.env.PORT )
})