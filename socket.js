const express = require('express')
const cors = require('cors')
const http = require('http')
const {Server} = require('socket.io')

// const tempServiceRoute = require('./Routes/ServiceRoute')
const app = express()

app.use(express.json())
app.use(cors())
require("dotenv").config();


const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST'],
        
    }
})

let onlineUsers = []

const addNewUser = (username, socketId) => {
    
    !onlineUsers.some((user)=>user.username === username) && onlineUsers.push({username, socketId})
    console.log(onlineUsers)
}

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) =>user.socketId !== socketId)
}

const getUser = (username) =>{
    return onlineUsers.find((user)=>user.username === username)
    // return username
}

// For socket.io
io.on('connection', (socket)=>{
    // console.log('user connected: ' + socket.id)

    socket.on('message', ({notificationMessage, receiverName})=>{
        const receiver = getUser(receiverName)
        if(receiver !== undefined)
        {
            io.to(receiver.socketId).emit('message', notificationMessage)
        }
        
    })

    socket.on('loggedUser', (username)=>{
        addNewUser(username, socket.id)
        io.emit('onlineUsers', onlineUsers)
    })

    socket.on('disconnect', () => {
        removeUser(socket.id)
        io.emit('onlineUsers', onlineUsers)
      });

    
})





server.listen(5001, ()=>{
    console.log("App listening at port: " + 5001 )
})