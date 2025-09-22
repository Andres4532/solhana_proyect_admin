const { validationResult } = require('express-validator');
const PricingPV = require('../models/PricingPV');
const ProductVariable = require('../models/ProductVariable');

/**
 * @swagger
 * components:
 *   schemas:
 *     PricingPV:
 *       type: object
 *       required:
 *         - name
 *         - basePrice
 *         - pv
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre de la opción de precio
 *         type:
 *           type: string
 *           enum: [fixed, percentage, dynamic]
 *           description: Tipo de precio (fijo, porcentaje, dinámico)
 *         basePrice:
 *           type: number
 *           minimum: 0
 *           description: Precio base de la opción
 *         discountIncrement:
 *           type: number
 *           description: Descuento o incremento en porcentaje
 *         description:
 *           type: string
 *           description: Descripción de la opción de precio
 *         validFrom:
 *           type: string
 *           format: date
 *           description: Fecha de inicio de validez
 *         validUntil:
 *           type: string
 *           format: date
 *           description: Fecha de fin de validez (opcional)
 *         pv:
 *           type: string
 *           format: objectId
 *           description: ID de la variable de producto asociada
 *         active:
 *           type: boolean
 *           default: true
 *           description: Si la opción está activa
 */

class PricingController {
  /**
   * @swagger
   * /api/pricing:
   *   get:
   *     summary: Obtener todas las opciones de precio
   *     tags: [Pricing]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Límite de opciones por página
   *       - in: query
   *         name: active
   *         schema:
   *           type: boolean
   *         description: Filtrar por estado activo
   *     responses:
   *       200:
   *         description: Lista de opciones de precio
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/PricingPV'
   *                 totalPages:
   *                   type: integer
   *                 currentPage:
   *                   type: integer
   *                 total:
   *                   type: integer
   */
  static async getAllPricing(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (req.query.active !== undefined) {
        filter.active = req.query.active === 'true';
      }

      const total = await PricingPV.countDocuments(filter);
      const pricingOptions = await PricingPV.find(filter)
        .sort({ createdAt: -1 })
          .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        data: pricingOptions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Error getting pricing options:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/pricing:
   *   post:
   *     summary: Crear una nueva opción de precio
   *     tags: [Pricing]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PricingPV'
   *     responses:
   *       201:
   *         description: Opción de precio creada exitosamente
   */
     static async createPricing(req, res) {
     try {
       console.log('🔍 BACKEND - req.body recibido:', req.body);
       console.log('🔍 BACKEND - basePrice recibido:', req.body.basePrice, 'tipo:', typeof req.body.basePrice);
       
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           message: 'Datos de entrada inválidos',
           errors: errors.array()
         });
       }

       const { 
         name, 
         type, 
         basePrice, 
         discountIncrement, 
         description, 
         validFrom, 
         validUntil, 
         pv,
         active,
         maxQuantity
       } = req.body;

       // Validar que la variable de producto existe
       const productVariable = await ProductVariable.findById(pv);
       if (!productVariable) {
         return res.status(404).json({
           success: false,
           message: 'Variable de producto no encontrada'
         });
       }

       const pricingOption = new PricingPV({
         name,
         type: type || 'fixed',
         basePrice: parseFloat(basePrice) || 0,
         discountIncrement: parseFloat(discountIncrement) || 0,
         description: description || '',
         validFrom: validFrom ? new Date(validFrom) : new Date(),
         validUntil: validUntil ? new Date(validUntil) : null,
         pv,
         active: active !== undefined ? active : true,
         maxQuantity: parseInt(maxQuantity) || 10
       });

       console.log('🔍 BACKEND - Objeto PricingPV creado:', pricingOption);
       console.log('🔍 BACKEND - basePrice en objeto:', pricingOption.basePrice, 'tipo:', typeof pricingOption.basePrice);

       const savedPricing = await pricingOption.save();
       
       console.log('🔍 BACKEND - Objeto guardado en DB:', savedPricing);
       console.log('🔍 BACKEND - basePrice guardado:', savedPricing.basePrice, 'tipo:', typeof savedPricing.basePrice);

       // Actualizar la variable de producto para incluir esta opción
       await ProductVariable.findByIdAndUpdate(pv, {
         $addToSet: { options: savedPricing._id }
       });

       res.status(201).json({
         success: true,
         message: 'Opción de precio creada exitosamente',
         data: savedPricing
       });
     } catch (error) {
       console.error('Error creating pricing option:', error);
       res.status(500).json({
         success: false,
         message: 'Error interno del servidor',
         error: error.message
       });
     }
   }

  /**
   * @swagger
   * /api/pricing/bulk:
   *   post:
   *     summary: Crear múltiples opciones de precio
   *     tags: [Pricing]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               options:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/PricingPV'
   *     responses:
   *       201:
   *         description: Opciones de precio creadas exitosamente
   */
     static async createBulkPricing(req, res) {
     try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           message: 'Datos de entrada inválidos',
           errors: errors.array()
         });
       }

       const { pv, options } = req.body;

       if (!Array.isArray(options) || options.length === 0) {
         return res.status(400).json({
           success: false,
           message: 'Se requiere un array de opciones de precio'
         });
       }

       // Validar que la variable de producto existe
       const productVariable = await ProductVariable.findById(pv);
       if (!productVariable) {
         return res.status(404).json({
           success: false,
           message: 'Variable de producto no encontrada'
         });
       }

       const pricingOptions = options.map(option => ({
         name: option.name,
         type: option.type || 'fixed',
         basePrice: parseFloat(option.basePrice) || 0,
         discountIncrement: parseFloat(option.discountIncrement) || 0,
         description: option.description || '',
         validFrom: option.validFrom ? new Date(option.validFrom) : new Date(),
         validUntil: option.validUntil ? new Date(option.validUntil) : null,
         pv,
         active: option.active !== undefined ? option.active : true,
         maxQuantity: parseInt(option.maxQuantity) || 10
       }));

       const createdOptions = await PricingPV.insertMany(pricingOptions);

       // Actualizar la variable de producto para incluir todas las opciones
       const pricingIds = createdOptions.map(p => p._id);
       await ProductVariable.findByIdAndUpdate(pv, {
         $addToSet: { options: { $each: pricingIds } }
       });

       res.status(201).json({
         success: true,
         message: `${createdOptions.length} opciones de precio creadas exitosamente`,
         data: createdOptions
       });
     } catch (error) {
       console.error('Error creating bulk pricing options:', error);
       res.status(500).json({
         success: false,
         message: 'Error interno del servidor',
         error: error.message
       });
     }
   }

  /**
   * @swagger
   * /api/pricing/{id}:
   *   get:
   *     summary: Obtener una opción de precio por ID
   *     tags: [Pricing]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: objectId
   *     responses:
   *       200:
   *         description: Opción de precio obtenida exitosamente
   */
  static async getPricingById(req, res) {
    try {
      const { id } = req.params;

      const pricingOption = await PricingPV.findById(id);

      if (!pricingOption) {
        return res.status(404).json({
          success: false,
          message: 'Opción de precio no encontrada'
        });
      }

      res.json({
        success: true,
        data: pricingOption
      });
    } catch (error) {
      console.error('Error getting pricing option:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/pricing/{id}:
   *   put:
   *     summary: Actualizar una opción de precio
   *     tags: [Pricing]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: objectId
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PricingPV'
   *     responses:
   *       200:
   *         description: Opción de precio actualizada exitosamente
   */
  static async updatePricing(req, res) {
    try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           message: 'Datos de entrada inválidos',
           errors: errors.array()
         });
       }

      const { id } = req.params;
       const { 
         name, 
         type, 
         basePrice, 
         discountIncrement, 
         description, 
         validFrom, 
         validUntil, 
         active,
         maxQuantity
       } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
       if (type !== undefined) updateData.type = type;
       if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice) || 0;
       if (discountIncrement !== undefined) updateData.discountIncrement = parseFloat(discountIncrement) || 0;
       if (description !== undefined) updateData.description = description;
       if (validFrom !== undefined) updateData.validFrom = validFrom ? new Date(validFrom) : new Date();
       if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;
       if (active !== undefined) updateData.active = active;
       if (maxQuantity !== undefined) updateData.maxQuantity = parseInt(maxQuantity) || 10;

       const pricingOption = await PricingPV.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
       );

       if (!pricingOption) {
        return res.status(404).json({
          success: false,
          message: 'Opción de precio no encontrada'
        });
      }

      res.json({
        success: true,
         message: 'Opción de precio actualizada exitosamente',
         data: pricingOption
      });
    } catch (error) {
      console.error('Error updating pricing option:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/pricing/{id}:
   *   delete:
   *     summary: Eliminar una opción de precio
   *     tags: [Pricing]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: objectId
   *     responses:
   *       200:
   *         description: Opción de precio eliminada exitosamente
   */
  static async deletePricing(req, res) {
    try {
      const { id } = req.params;

      const pricingOption = await PricingPV.findById(id);

      if (!pricingOption) {
        return res.status(404).json({
          success: false,
          message: 'Opción de precio no encontrada'
        });
      }

      // Remove the pricing option from all variables that reference it
      await ProductVariable.updateMany(
        { options: id },
        { $pull: { options: id } }
      );

      await PricingPV.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Opción de precio eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting pricing option:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = PricingController;
