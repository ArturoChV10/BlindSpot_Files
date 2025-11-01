const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class ColorProcessor {
  
  // Procesar imagen para resaltar/mantener colores específicos
  async processImageForColorHighlight(imagePath, targetColor, tolerance = 0.3, action = 'keep-only') {
    try {
      console.log('Iniciando procesamiento de imagen...');
      
      // Leer la imagen original
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      console.log('Dimensiones originales:', metadata.width, 'x', metadata.height);
      console.log('Color objetivo: RGB(', targetColor.r, targetColor.g, targetColor.b, ')');
      console.log('Tolerancia:', tolerance);
      console.log('Acción:', action);

      let processedImage;

      if (action === 'keep-only') {
        // Para "Mantener Solo Este Color" - convertir a escala de grises primero
        processedImage = await this.applyKeepOnlyFilter(imagePath, targetColor, tolerance);
      } else {
        // Para "Resaltar Este Color" - aumentar saturación
        processedImage = await this.applyHighlightFilter(imagePath, targetColor, tolerance);
      }

      // Guardar imagen procesada
      const outputFilename = `processed-${Date.now()}.jpg`;
      const outputPath = path.join('processed', outputFilename);

      await processedImage.jpeg({ quality: 90 }).toFile(outputPath);

      console.log('Imagen procesada guardada en:', outputPath);

      // Obtener tamaños de archivo
      const originalStats = fs.statSync(imagePath);
      const processedStats = fs.statSync(outputPath);

      return {
        processedPath: outputPath,
        originalSize: originalStats.size,
        processedSize: processedStats.size
      };

    } catch (error) {
      console.error('Error en processImageForColorHighlight:', error);
      throw error;
    }
  }

  // Aplicar filtro "Mantener Solo Este Color"
  async applyKeepOnlyFilter(imagePath, targetColor, tolerance) {
    try {
      // Primero convertir a escala de grises
      const grayscale = await sharp(imagePath)
        .grayscale()
        .toBuffer();

      // Luego superponer el color original con máscara basada en la similitud de color
      return await this.createColorMask(imagePath, grayscale, targetColor, tolerance);
      
    } catch (error) {
      console.error('Error en applyKeepOnlyFilter:', error);
      throw error;
    }
  }

  // Aplicar filtro "Resaltar Este Color"
  async applyHighlightFilter(imagePath, targetColor, tolerance) {
    try {
      // Aumentar saturación general
      const saturated = await sharp(imagePath)
        .modulate({
          saturation: 1.5
        })
        .toBuffer();

      return sharp(saturated);
      
    } catch (error) {
      console.error('Error en applyHighlightFilter:', error);
      throw error;
    }
  }

  // Crear máscara de color (implementación simplificada)
  async createColorMask(originalPath, grayscaleBuffer, targetColor, tolerance) {
    // Esta es una implementación simplificada
    // En una versión real necesitarías procesamiento pixel por pixel
    
    // Por ahora, devolvemos la imagen en escala de grises
    // Esto es un placeholder - el procesamiento real requeriría más complejidad
    return sharp(grayscaleBuffer);
  }

  // Calcular distancia entre colores (fórmula euclidiana)
  calculateColorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
      Math.pow(r2 - r1, 2) + 
      Math.pow(g2 - g1, 2) + 
      Math.pow(b2 - b1, 2)
    );
  }
}

module.exports = new ColorProcessor();
module.exports.processImageForColorHighlight = 
  module.exports.processImageForColorHighlight.bind(module.exports);