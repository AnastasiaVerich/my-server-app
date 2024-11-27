//описывает маршруты для работы с фото
const express = require('express');
const { find_user_by_photo, save_user_photo } = require('../controllers/uploadPhotoController');
const multer = require('multer');

const router = express.Router();

// Настройка multer для загрузки изображений
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Маршрут для загрузки фото
router.post('/find_user_by_photo', upload.single('photo'), find_user_by_photo);
// Маршрут для загрузки фото
router.post('/save_user_photo', upload.single('photo'), save_user_photo);

module.exports = router;
