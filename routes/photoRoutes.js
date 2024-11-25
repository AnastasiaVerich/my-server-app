//описывает маршруты для работы с фото
const express = require('express');
const { uploadPhoto } = require('../controllers/uploadPhotoController');

const router = express.Router();

// Маршрут для загрузки фото
router.post('/upload-photo', uploadPhoto);

module.exports = router;

