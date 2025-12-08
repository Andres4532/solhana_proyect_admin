// Opciones predefinidas de atributos y sus valores
export const attributeOptions: Record<string, string[]> = {
  'Color': [
    'Negro', 'Blanco', 'Gris', 'Beige', 'Marrón', 'Rojo', 'Rosa', 'Naranja',
    'Amarillo', 'Verde', 'Azul', 'Morado', 'Violeta', 'Dorado', 'Plateado',
    'Multicolor', 'Transparente'
  ],
  'Talla': [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36',
    '38', '40', '42', '44', '46', '48', '50', '52', '54', 'Única'
  ],
  'Material': [
    'Algodón', 'Poliéster', 'Lino', 'Seda', 'Lana', 'Cuero', 'Gamuza',
    'Denim', 'Mezclilla', 'Sintético', 'Elástico', 'Spandex', 'Modal',
    'Bambú', 'Orgánico', 'Reciclado'
  ],
  'Capacidad': [
    '1L', '2L', '3L', '5L', '10L', '20L', '500ml', '750ml', '1.5L',
    'Pequeño', 'Mediano', 'Grande', 'Extra Grande'
  ],
  'Modelo': [
    'Clásico', 'Moderno', 'Vintage', 'Deportivo', 'Elegante', 'Casual',
    'Formal', 'Urbano', 'Rústico', 'Minimalista'
  ],
  'Tipo de Manga': [
    'Sin mangas', 'Manga corta', 'Manga larga', 'Manga 3/4', 'Manga raglán',
    'Manga kimono', 'Manga campana'
  ],
  'Tipo de Cuello': [
    'Redondo', 'V', 'Cuello alto', 'Cuello bajo', 'Cuello polo', 'Cuello camisa',
    'Cuello barco', 'Cuello pico', 'Sin cuello'
  ],
  'Tipo de Cierre': [
    'Sin cierre', 'Cremallera', 'Botones', 'Velcro', 'Cordón', 'Gancho',
    'Imán', 'Elástico'
  ],
  'Estilo': [
    'Ajustado', 'Regular', 'Holgado', 'Oversized', 'Relaxed', 'Slim',
    'Skinny', 'Wide', 'Straight'
  ],
  'Género': [
    'Unisex', 'Masculino', 'Femenino', 'Niño', 'Niña', 'Bebé'
  ],
  'Temporada': [
    'Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'
  ],
  'Tipo de Suela': [
    'Goma', 'Cuero', 'Sintética', 'EVA', 'TPU', 'Caucho', 'Goma antideslizante'
  ],
  'Talla de Calzado': [
    '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46',
    '5', '6', '7', '8', '9', '10', '11', '12', '13'
  ]
}

export const attributeNames = Object.keys(attributeOptions)

export function getAttributeOptions(attributeName: string): string[] {
  return attributeOptions[attributeName] || []
}

export function hasPredefinedOptions(attributeName: string): boolean {
  return attributeName in attributeOptions
}

