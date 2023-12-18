const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

require('./socket');

const Route = require('./Routes/Routes')
const http = require('http')
const {Server} = require('socket.io')

// const tempServiceRoute = require('./Routes/ServiceRoute')
const app = express()

app.use(express.json())
app.use(cors())
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database Connected")
}).catch((err)=>{
    console.log(err)
})

app.use("/api", Route)


app.listen(process.env.PORT, ()=>{
    console.log("App listening at port: " + process.env.PORT )
})