const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const Route = require('./Routes/Routes')
const http = require('http')
const {Server} = require('socket.io')


// const tempServiceRoute = require('./Routes/ServiceRoute')
const app = express()
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5000",, "http://localhost:3000",, 'https://web-based-service-finder.vercel.app', 'https://kanoah.onrender.com', 'https://kanoah-web.vercel.app', 'https://kanoah-be.vercel.app'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000',  'https://web-based-service-finder.vercel.app', 'https://kanoah.onrender.com', 'exp://192.168.55.106:8081', 'http://192.168.55.106:8081/_expo/loading', 'https://kanoah-web.vercel.app', 'https://kanoah-be.vercel.app/']
}))
app.use(cookieParser())
app.use(express.json())

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
}

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
}

const getUser = (username) => {
    return onlineUsers.find((user) => user.username === username);
}

// For socket.io
io.on('connection', (socket) => {
    // Notify user theres a new message
    socket.on('message', ({ notificationMessage, receiverName }) => {
        const receiver = getUser(receiverName);
        if (receiver !== undefined) {
            io.to(receiver.socketId).emit('message', notificationMessage);
        }
    });

    // Notify user theres a new booking
    socket.on('New_Notification', ({ notification, receiver }) => {
        
        const receiverUser = getUser(receiver);
        if (receiverUser !== undefined) {
            io.to(receiverUser.socketId).emit('New_Notification', notification);
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

    socket.on('disconnectUser', () => {
        removeUser(socket.id);
        io.emit('onlineUsers', onlineUsers);
    });
});


server.listen(process.env.PORT, ()=>{
    console.log("App listening at port: " + process.env.PORT )
    
})