const { Pool } = require('pg');
const dbConfig = require('../config/dbConfig');

// Настройка подключения к базе данных
const pool = new Pool(dbConfig);

// Функция для сохранения фото
exports.addUser = async (userId,userPhone ) => {
    const query = 'INSERT INTO users (id_user, phone, created_at, updated_at) VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)';
    const result = await pool.query(query, [userId,userPhone]);
    return result.rows[0].id; // Возвращает ID записи
};
