const express = require('express');
const { getCategories, getCategoryBySlug, createCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticationMiddle, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.post('/categories/new', authenticationMiddle, isAdmin, createCategory);
router.delete('/categories/:id', authenticationMiddle, isAdmin, deleteCategory);

module.exports = router;
