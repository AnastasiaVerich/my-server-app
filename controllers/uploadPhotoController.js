//содержит логику для загрузки фото
const { savePhoto } = require('../models/photoModel');

const multer = require('multer');
const faceapi = require('face-api.js');
const canvas = require('canvas');
// Инициализация face-api.js с нужными моделями
async function loadFaceApiModels() {
    const modelPath = './models'; // Путь к папке с моделями
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
}
// Функция для сравнения эмбеддинга с базой данных
async function compareEmbeddings(newEmbedding) {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT id, name, embedding FROM face_embeddings');
        for (const row of result.rows) {
            const storedEmbedding = row.embedding;

            // Сравниваем эмбеддинги (вычисляем расстояние)
            const distance = compareFaceEmbeddings(newEmbedding, storedEmbedding);
            if (distance < 0.6) { // Пороговое значение
                return row; // Найдено совпадение
            }
        }
        return null; // Совпадение не найдено
    } finally {
        client.release();
    }
}
// Функция для расчета расстояния между эмбеддингами
function compareFaceEmbeddings(embedding1, embedding2) {
    // Евклидово расстояние между двумя эмбеддингами
    let distance = 0;
    for (let i = 0; i < embedding1.length; i++) {
        distance += Math.pow(embedding1[i] - embedding2[i], 2);
    }
    return Math.sqrt(distance);
}
// Функция для сохранения эмбеддинга в PostgreSQL
async function saveEmbeddingToDB(embedding, name) {
    const client = await pool.connect();
    try {
        await client.query(
            'INSERT INTO face_embeddings (name, embedding) VALUES ($1, $2)',
            [name, embedding]
        );
    } finally {
        client.release();
    }
}
// Настройка multer для загрузки изображений
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.uploadPhoto = async (req, res) => {
    try {
        const base64Image = req.body.image;

        if (!base64Image) {
            return res.status(400).json({ error: 'No image provided' });
        }

         // Декодируем Base64 строку в буфер
        const buffer = Buffer.from(base64Image, 'base64');

        // Загружаем изображение в canvas
        const image = await canvas.loadImage(buffer);
        const detections = await faceapi.detectAllFaces(image)
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (detections.length === 0) {
            return res.status(400).send({ error: 'No faces found in the image' });
        }

/*        // Извлекаем эмбеддинги лиц
        const faceEmbeddings = detections.map(d => d.descriptor);

        // Сравниваем эмбеддинг с базой данных
        for (const embedding of faceEmbeddings) {
            const person = await compareEmbeddings(embedding);
            if (person) {
                return res.send({ message: `Person found: ${person.name}` });
            }
        }

        // Если лицо не найдено в базе данных, сохраняем как "unknown"
        await saveEmbeddingToDB(faceEmbeddings[0], 'unknown');
        return res.send({ message: 'Face not recognized, saved as "unknown"' });*/

    } catch (error) {
        console.error('Error uploading photo:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

/*exports.uploadPhoto = async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Декодируем Base64 в бинарные данные
        const photoBuffer = Buffer.from(image.split(',')[1], 'base64');

        // Сохраняем фото в базе данных
        const photoId = await savePhoto(photoBuffer);

        return res.json({ message: 'Photo uploaded successfully', photoId });
    } catch (error) {
        console.error('Error uploading photo:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};*/
