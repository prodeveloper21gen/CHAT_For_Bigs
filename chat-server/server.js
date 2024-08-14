// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка загрузчика файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Данные для хранения пользователей и сообщений
let users = [];
let messages = [];

// Эндпоинты API
app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/users', (req, res) => {
    const newUser = { id: Date.now().toString(), name: req.body.name };
    users.push(newUser);
    res.json(newUser);
});

app.get('/api/messages', (req, res) => {
    res.json(messages);
});

app.post('/api/messages', upload.single('image'), (req, res) => {
    const newMessage = {
        id: Date.now().toString(),
        userId: req.body.userId,
        userName: req.body.userName,
        text: req.body.text,
        avatar: req.file ? req.file.path : null,
        image: req.file ? req.file.path : null
    };
    messages.push(newMessage);
    res.json(newMessage);
});

app.put('/api/messages/:id', (req, res) => {
    const message = messages.find(msg => msg.id === req.params.id);
    if (message) {
        message.text = req.body.text;
        res.json(message);
    } else {
        res.status(404).json({ error: 'Message not found' });
    }
});

app.delete('/api/messages/:id', (req, res) => {
    messages = messages.filter(msg => msg.id !== req.params.id);
    res.json({ success: true });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});