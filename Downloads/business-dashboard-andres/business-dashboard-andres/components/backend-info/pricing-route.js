const express = require('express');
const router = express.Router();
const PricingController = require('../controllers/pricingController');
const { auth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// GET /pricing - Obtener todas las opciones de precio
router.get('/', PricingController.getAllPricing);

// POST /pricing - Crear una nueva opción de precio
router.post('/', PricingController.createPricing);

// POST /pricing/bulk - Crear múltiples opciones de precio
router.post('/bulk', PricingController.createBulkPricing);

// GET /pricing/:id - Obtener una opción de precio por ID
router.get('/:id', PricingController.getPricingById);

// PUT /pricing/:id - Actualizar una opción de precio
router.put('/:id', PricingController.updatePricing);

// DELETE /pricing/:id - Eliminar una opción de precio
router.delete('/:id', PricingController.deletePricing);

module.exports = router;
