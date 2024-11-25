// Точка входа приложения.
const express = require('express');
const bodyParser = require('body-parser');
const photoRoutes = require('./routes/photoRoutes'); // Маршруты для работы с фото

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));

// Роуты
app.use('/api/photos', photoRoutes);

// Обработчик ошибок 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Обработчик ошибок сервера
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
