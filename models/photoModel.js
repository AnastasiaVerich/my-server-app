//для операций с таблицей photos
const { Pool } = require('pg');

// Настройка подключения к базе данных
const pool = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'test',
    password: 'test',
    port: 5432,
});

// Функция для сохранения фото
exports.savePhoto = async (photoBuffer) => {
    const query = 'INSERT INTO photos (image) VALUES ($1) RETURNING id';
    const result = await pool.query(query, [photoBuffer]);
    return result.rows[0].id; // Возвращает ID записи
};
