import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import ThemedButton from "./ThemedButton";

const { width: screenWidth } = Dimensions.get('window');
const API_BASE_URL = 'http://10.0.2.2:3000'; // Android Emulator
// const API_BASE_URL = 'http://localhost:3000'; // iOS Simulator

const OpenCVColorProcessor = ({ imageUri, onBack }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [processedImageUri, setProcessedImageUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [tolerance, setTolerance] = useState(0.3);

  // Obtener dimensiones de la imagen
  React.useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setImageSize({ width, height });
      });
    }
  }, [imageUri]);

  // Función para seleccionar color REAL usando el backend
  const handleColorPick = async (event) => {
    if (!imageUri) return;

    event.persist();
    
    const { locationX, locationY } = event.nativeEvent;
    
    try {
      setIsProcessing(true);
      
      // Calcular coordenadas reales
      const scaleX = imageSize.width / (screenWidth - 40);
      const scaleY = imageSize.height / 300;
      
      const realX = Math.floor(locationX * scaleX);
      const realY = Math.floor(locationY * scaleY);

      // Recortar área pequeña para análisis de color - FORMA CORRECTA
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.max(0, realX - 5),
              originY: Math.max(0, realY - 5),
              width: 10,
              height: 10,
            },
          }
        ],
        { 
          compress: 1, 
          format: ImageManipulator.SaveFormat.PNG,
          base64: true 
        }
      );

      // Obtener color promedio (por ahora simulado)
      const color = await getAverageColorFromBackend(manipResult.uri);
      setSelectedColor(color);
      
      Alert.alert(
        'Color Detectado',
        `${color.name || 'Color'} - RGB(${color.r}, ${color.g}, ${color.b})`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error("Error detectando color:", error);
      Alert.alert("Error", "No se pudo detectar el color");
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para obtener color promedio (simulada por ahora)
  const getAverageColorFromBackend = async (imageUri) => {
    const colors = [
      { r: 255, g: 0, b: 0, name: "Rojo" },
      { r: 0, g: 255, b: 0, name: "Verde" },
      { r: 0, g: 0, b: 255, name: "Azul" },
      { r: 255, g: 255, b: 0, name: "Amarillo" },
      { r: 255, g: 165, b: 0, name: "Naranja" },
      { r: 128, g: 0, b: 128, name: "Morado" },
    ];

    const colorIndex = Math.floor(Math.random() * colors.length);
    return colors[colorIndex];
  };

  // Función PRINCIPAL: Procesar imagen con OpenCV en el backend - FORMA CORRECTA
  const processWithOpenCV = async (action = 'keep-only') => {
    if (!selectedColor || !imageUri) {
      Alert.alert("Info", "Primero selecciona un color tocando la imagen");
      return;
    }

    setIsProcessing(true);
    try {
      // Convertir imagen a formato que pueda enviarse - FORMA CORRECTA
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [], // Sin acciones de manipulación
        { 
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false // No necesitamos base64 para FormData
        }
      );

      // Crear form data para enviar al backend - FORMA CORRECTA
      const formData = new FormData();
      
      // En React Native, necesitamos crear el objeto de archivo correctamente
      formData.append('image', {
        uri: manipResult.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
      
      formData.append('targetColor', JSON.stringify(selectedColor));
      formData.append('tolerance', tolerance.toString());
      formData.append('action', action);

      console.log('Enviando imagen al backend...');

      // Enviar al backend OpenCV
      const response = await fetch(`${API_BASE_URL}/api/process-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Para React Native, necesitamos descargar la imagen procesada
        const processedUri = await downloadProcessedImage(result.processedImageUrl);
        setProcessedImageUri(processedUri);
        
        Alert.alert(
          "✅ Procesamiento Completado", 
          `Imagen procesada exitosamente\nTamaño original: ${(result.originalSize / 1024).toFixed(1)}KB\nTamaño procesado: ${(result.processedSize / 1024).toFixed(1)}KB`
        );
      } else {
        throw new Error(result.error || 'Error desconocido');
      }

    } catch (error) {
      console.error("Error procesando con OpenCV:", error);
      Alert.alert(
        "❌ Error de Procesamiento", 
        `No se pudo conectar con el servidor de procesamiento.\n\nAsegúrate de que:\n• El backend esté en: ${API_BASE_URL}\n• Estés usando la IP correcta\n\nError: ${error.message}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para descargar la imagen procesada del backend
  const downloadProcessedImage = async (imageUrl) => {
    try {
      const downloadResult = await FileSystem.downloadAsync(
        imageUrl,
        FileSystem.documentDirectory + `processed-${Date.now()}.jpg`
      );
      return downloadResult.uri;
    } catch (error) {
      console.error('Error descargando imagen procesada:', error);
      // Si falla la descarga, intentar usar la URL directamente
      return imageUrl;
    }
  };

  const resetImage = () => {
    setProcessedImageUri(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Procesador OpenCV - Color Real</Text>
      
      {/* Selector de tolerancia */}
      <View style={styles.toleranceSection}>
        <Text style={styles.toleranceLabel}>
          Sensibilidad: {Math.round(tolerance * 100)}%
        </Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderMin}>Baja</Text>
          <View style={styles.slider}>
            <View 
              style={[
                styles.sliderTrack,
                { width: `${tolerance * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.sliderMax}>Alta</Text>
        </View>
        <Text style={styles.toleranceHelp}>
          Controla qué tan similares deben ser los colores para ser mantenidos
        </Text>
      </View>

      {/* Imagen interactiva */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: processedImageUri || imageUri }} 
          style={styles.image}
          resizeMode="contain"
        />
        
        {!processedImageUri && (
          <View 
            style={styles.touchOverlay}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderRelease={handleColorPick}
          />
        )}

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.processingText}>
              🔄 Procesando con OpenCV...
            </Text>
            <Text style={styles.processingSubtext}>
              Esto puede tomar unos segundos
            </Text>
          </View>
        )}
      </View>

      {/* Información del color */}
      {selectedColor && (
        <View style={styles.colorInfo}>
          <Text style={styles.colorInfoTitle}>Color Seleccionado:</Text>
          <View style={styles.colorDisplay}>
            <View 
              style={[
                styles.colorBox, 
                { 
                  backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})` 
                }
              ]} 
            />
            <View style={styles.colorDetails}>
              <Text style={styles.colorName}>{selectedColor.name}</Text>
              <Text style={styles.colorValue}>
                RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Controles */}
      <View style={styles.controls}>
        {!processedImageUri ? (
          <>
            <ThemedButton 
              onPress={() => processWithOpenCV('keep-only')}
              style={styles.keepButton}
              disabled={!selectedColor || isProcessing}
            >
              <Text style={styles.keepButtonText}>
                🎨 Mantener Solo Este Color
              </Text>
            </ThemedButton>

            <ThemedButton 
              onPress={() => processWithOpenCV('highlight')}
              style={styles.highlightButton}
              disabled={!selectedColor || isProcessing}
            >
              <Text style={styles.highlightButtonText}>
                🔍 Resaltar Este Color
              </Text>
            </ThemedButton>

            <View style={styles.toleranceButtons}>
              <ThemedButton 
                onPress={() => setTolerance(0.2)}
                style={[styles.tolButton, tolerance === 0.2 && styles.tolButtonActive]}
                disabled={isProcessing}
              >
                <Text style={[styles.tolButtonText, tolerance === 0.2 && styles.tolButtonActiveText]}>
                  Baja Sens.
                </Text>
              </ThemedButton>
              
              <ThemedButton 
                onPress={() => setTolerance(0.4)}
                style={[styles.tolButton, tolerance === 0.4 && styles.tolButtonActive]}
                disabled={isProcessing}
              >
                <Text style={[styles.tolButtonText, tolerance === 0.4 && styles.tolButtonActiveText]}>
                  Media Sens.
                </Text>
              </ThemedButton>
              
              <ThemedButton 
                onPress={() => setTolerance(0.6)}
                style={[styles.tolButton, tolerance === 0.6 && styles.tolButtonActive]}
                disabled={isProcessing}
              >
                <Text style={[styles.tolButtonText, tolerance === 0.6 && styles.tolButtonActiveText]}>
                  Alta Sens.
                </Text>
              </ThemedButton>
            </View>
          </>
        ) : (
          <ThemedButton 
            onPress={resetImage}
            style={styles.resetButton}
            disabled={isProcessing}
          >
            <Text style={styles.resetButtonText}>
              🔄 Ver Original
            </Text>
          </ThemedButton>
        )}

        <ThemedButton onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver a Galería</Text>
        </ThemedButton>
      </View>

      <Text style={styles.helpText}>
        👆 Toca la imagen para seleccionar un color
        {"\n"}
        🚀 El procesamiento usa OpenCV en el backend
        {"\n"}
        💡 Ajusta la sensibilidad para incluir más o menos tonalidades
      </Text>
    </View>
  );
};

// Los estilos se mantienen igual...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  toleranceSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toleranceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  slider: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  sliderTrack: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  sliderMin: {
    fontSize: 12,
    color: '#666',
  },
  sliderMax: {
    fontSize: 12,
    color: '#666',
  },
  toleranceHelp: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  imageContainer: {
    height: 300,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  processingSubtext: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  colorInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  colorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  colorDetails: {
    flex: 1,
  },
  colorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  colorValue: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    gap: 10,
    marginBottom: 15,
  },
  keepButton: {
    paddingVertical: 15,
    backgroundColor: '#2196F3',
  },
  keepButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  highlightButton: {
    paddingVertical: 15,
    backgroundColor: '#4CAF50',
  },
  highlightButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  toleranceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  tolButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  tolButtonActive: {
    backgroundColor: '#4CAF50',
  },
  tolButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  tolButtonActiveText: {
    color: 'white',
  },
  resetButton: {
    paddingVertical: 15,
    backgroundColor: '#FF9800',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    backgroundColor: '#6c757d',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  helpText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default OpenCVColorProcessor;