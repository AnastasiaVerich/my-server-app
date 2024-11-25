//содержит логику для загрузки фото
const { savePhoto } = require('../models/photoModel');

exports.uploadPhoto = async (req, res) => {
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
};
