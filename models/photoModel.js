//для операций с таблицей photos
const { Pool } = require('pg');
const  dbConfig  = require('../config/dbConfig');

// Настройка подключения к базе данных
const pool = new Pool(dbConfig);

// Функция для сохранения фото
exports.savePhoto = async (photoBuffer) => {
    const query = 'INSERT INTO photos (image) VALUES ($1) RETURNING id';
    const result = await pool.query(query, [photoBuffer]);
    return result.rows[0].id; // Возвращает ID записи
};
