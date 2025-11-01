const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processImageForColorHighlight } = require('./colorProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

// Función para crear directorio si no existe
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Directorio creado: ${dir}`);
  }
};

// Crear directorios necesarios
ensureDirectoryExists('uploads');
ensureDirectoryExists('processed');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/processed', express.static('processed'));

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

// Endpoint para procesar imágenes
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    const { targetColor, tolerance, action } = req.body;
    
    if (!targetColor) {
      return res.status(400).json({ error: 'Color objetivo requerido' });
    }

    console.log('Procesando imagen:', req.file.filename);
    console.log('Color objetivo:', targetColor);
    console.log('Acción:', action);

    const result = await processImageForColorHighlight(
      req.file.path,
      JSON.parse(targetColor),
      parseFloat(tolerance || 0.3),
      action || 'keep-only'
    );

    res.json({
      success: true,
      processedImageUrl: `${req.protocol}://${req.get('host')}/processed/${path.basename(result.processedPath)}`,
      originalSize: result.originalSize,
      processedSize: result.processedSize
    });

  } catch (error) {
    console.error('Error procesando imagen:', error);
    res.status(500).json({ 
      error: 'Error procesando imagen',
      details: error.message 
    });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    directories: {
      uploads: fs.existsSync('uploads') ? 'EXISTS' : 'MISSING',
      processed: fs.existsSync('processed') ? 'EXISTS' : 'MISSING'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Directorio actual: ${process.cwd()}`);
  console.log(`📂 Uploads: ${fs.existsSync('uploads') ? '✅' : '❌'}`);
  console.log(`📂 Processed: ${fs.existsSync('processed') ? '✅' : '❌'}`);
});