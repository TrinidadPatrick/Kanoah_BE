const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const Route = require('./Routes/Routes')
const http = require('http')
const {Server} = require('socket.io')

// const tempServiceRoute = require('./Routes/ServiceRoute')
const app = express()
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5001", "http://localhost:3000", 'https://web-based-service-finder.vercel.app'],
        methods: ['GET', 'POST'],
    },
});


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

let onlineUsers = [];

const addNewUser = (username, socketId) => {
    !onlineUsers.some((user) => user.username === username) && onlineUsers.push({ username, socketId });
    console.log(onlineUsers);
}

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
}

const getUser = (username) => {
    return onlineUsers.find((user) => user.username === username);
}

// For socket.io
io.on('connection', (socket) => {
    socket.on('message', ({ notificationMessage, receiverName }) => {
        const receiver = getUser(receiverName);
        if (receiver !== undefined) {
            io.to(receiver.socketId).emit('message', notificationMessage);
        }
    });

    socket.on('loggedUser', (username) => {
        addNewUser(username, socket.id);
        io.emit('onlineUsers', onlineUsers);
    });

    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('onlineUsers', onlineUsers);
    });
});


server.listen(process.env.PORT, ()=>{
    console.log("App listening at port: " + process.env.PORT )
})