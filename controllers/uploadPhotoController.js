//содержит логику для загрузки фото
const faceapi = require("@vladmandic/face-api");
const path = require("path");
const tf = require('@tensorflow/tfjs-node');
const {getAllEmbedding, embeddingSave} = require("../models/IA_models");
const fs = require('fs');
const {savePhoto} = require("../models/photoModel");


async function loadModels() {
    const modelsPath = path.join(__dirname, "..", "ia_models");

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath); // Обнаружение лиц
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath); // Маркировка лиц
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath); // Эмбеддинги
    console.log("Модели загружены.");
}

loadModels().catch(console.error);

exports.find_user_by_photo = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({error: 'Нет изображения'});
        }

        const buffer = req.file.buffer;

        // Преобразуем изображение в тензор с помощью TensorFlow.js
        const tensor = tf.node.decodeImage(buffer);

        // Обнаружение лиц
        const detections = await faceapi
            .detectAllFaces(tensor)
            .withFaceLandmarks()
            .withFaceDescriptors();


        if (!detections.length) {
            return res.status(404).send({error: 'Лицо не найдено'});
        }


        // достаем все эмбеддинги
        const embeddingsFromDB = await getAllEmbedding(process.env.VERSION === 'dev');

        const detection = detections[0]

        const matches = [];
        for (let row of embeddingsFromDB) {
            const distance = faceapi.euclideanDistance(
                detection.descriptor,
                row.embedding
            );
            if (distance < 0.6) {
                matches.push({id: row.id, name: row.person_name, distance});
            }
        }
        if(process.env.VERSION !== 'dev'){
            // Сохраняем фото в базе данных
            await savePhoto(req.file.buffer);
        }

        res.status(200).json(matches.length ? matches : "Совпадений не найдено.");

    } catch (error) {
        console.error(error)
        return res.status(500).json({error: 'Упс'});
    }
};

exports.save_user_photo = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({error: 'Нет изображения'});
        }

        const buffer = req.file.buffer;

        // Преобразуем изображение в тензор с помощью TensorFlow.js
        const tensor = tf.node.decodeImage(buffer);

        // Обнаружение лиц
        const detections = await faceapi
            .detectAllFaces(tensor)
            .withFaceLandmarks()
            .withFaceDescriptors();


        if (!detections.length) {
            return res.status(404).send('Лицо не найдено.');
        }

        //лиц может быть несколько на фото, берем первое
        const findFirstFace = detections[0].descriptor

        if (process.env.VERSION === 'dev') {
            const embeddingsFolder = path.join(__dirname, '..', 'embeddings');
            if (!fs.existsSync(embeddingsFolder)) {
                fs.mkdirSync(embeddingsFolder);
            }
            const fileName = 'name' + Number(new Date())

            // Формируем путь к файлу
            const filePath = path.join(embeddingsFolder, `${fileName}.json`);

            // Сохраняем эмбеддинг в формате JSON
            fs.writeFileSync(filePath, JSON.stringify(findFirstFace, null, 2), 'utf-8');

        } else {
            await embeddingSave(JSON.stringify(findFirstFace, null, 2));
        }


        return res.status(200).json("Сохр");


    } catch (error) {
        console.error('Error uploading photo:', error);
        return res.status(500).json({error: 'Server error'});
    }
};

