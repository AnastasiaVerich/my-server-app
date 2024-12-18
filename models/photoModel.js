const { Pool } = require('pg');
const dbConfig = require('../config/dbConfig');

// Настройка подключения к базе данных
const pool = new Pool(dbConfig);

// Функция для сохранения фото
exports.savePhoto = async (userId,id_embedding, photoBuffer) => {
    const query = 'INSERT INTO photos (id_face_embedding,id_user, image) VALUES ($1,$2,$3)';
    const result = await pool.query(query, [userId,id_embedding, photoBuffer]);
    return result.rows[0].id; // Возвращает ID записи
};
