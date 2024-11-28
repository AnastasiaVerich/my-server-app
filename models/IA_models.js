//для операций с таблицей photos
const {Pool} = require('pg');
const dbConfig = require('../config/dbConfig');
const fs = require('fs');
const path = require("path");

// Настройка подключения к базе данных
const pool = new Pool(dbConfig);

// Функция для сохранения фото
exports.embeddingSave = async (findFirstFace) => {
    const query = 'INSERT INTO face_embeddings (person_name, embedding) VALUES ($1, $2) RETURNING id';
    const result = await pool.query(query, ["unknown",findFirstFace]);
    return result.rows[0].id; // Возвращает ID записи
};

exports.getAllEmbedding = async (isDev) => {
    if (isDev) {
        const folderPath = path.join(__dirname, '..', 'embeddings')
        // Получаем список файлов в папке
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

        // Инициализируем массив для результатов
        const embeddings = [];

        // Перебираем файлы
        for (const file of files) {
            const filePath = path.join(folderPath, file);

            // Читаем содержимое файла
            const data = fs.readFileSync(filePath, 'utf-8');

            // Парсим JSON и формируем объект
            const embeddingData = JSON.parse(data);

            embeddings.push({
                person_name: 'unknown', // Убираем расширение из имени файла
                id: file.replace('.json', ''),         // Можно заменить на уникальный идентификатор
                embedding: Object.values(embeddingData),
            });
        }
        return embeddings;
    } else {
        const embeddings = [];

        const query = 'SELECT * FROM face_embeddings';
        const result = await pool.query(query);

        return result.rows.map(el=>({
            person_name: el.person_name, // Убираем расширение из имени файла
            id: el.id,         // Можно заменить на уникальный идентификатор
            embedding: Object.values(el.embedding),
        }));

    }
};
