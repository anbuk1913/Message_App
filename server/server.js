const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.get('/', (req, res) => res.send('Socket.IO server running'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:2000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', (data) => {
        if (data.roomId) {
            socket.to(data.roomId).emit('receive_message', data);
        } else {
            socket.broadcast.emit('receive_message', data);
        }
    });

    socket.on('typing', (data) => {
        socket.to(data.roomId).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));