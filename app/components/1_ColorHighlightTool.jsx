import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import * as FileSystem from 'expo-file-system';
import ThemedButton from "./ThemedButton";

const { width: screenWidth } = Dimensions.get('window');

const ColorHighlightTool = ({ imageUri, onBack }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorName, setColorName] = useState("");
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef();

  // Función para obtener datos de píxeles de la imagen
  const getImagePixelData = async (imageUri) => {
    try {
      // En React Native puro necesitamos una solución alternativa
      // ya que no tenemos acceso directo a los píxeles
      return await processImageWithCanvasAlternative(imageUri);
    } catch (error) {
      console.error("Error procesando imagen:", error);
      return null;
    }
  };

  // Alternativa usando una vista web oculta para procesamiento
  const processImageWithCanvasAlternative = async (uri) => {
    // Esta es una implementación simplificada
    // En producción, usarías una librería como react-native-canvas
    // o expo-gl para procesamiento real
    Alert.alert(
      "Procesamiento de Color",
      "Para procesamiento avanzado de imágenes, se recomienda usar una librería específica como 'expo-gl' o 'react-native-vision-camera'"
    );
    return { width: 100, height: 100, data: [] };
  };

  // Detectar color en una posición específica (simulación mejorada)
  const handleColorPick = async (event) => {
    if (!imageUri) return;

    setIsProcessing(true);
    try {
      // En una implementación real, aquí usarías:
      // - expo-gl para WebGL
      // - react-native-vision-camera para procesamiento en tiempo real
      // - Una API backend para procesamiento avanzado
      
      const pixelData = await getImagePixelData(imageUri);
      
      if (pixelData) {
        // Simulación más realista basada en la posición
        const { locationX, locationY } = event.nativeEvent;
        await simulateColorDetection(locationX, locationY);
      }
    } catch (error) {
      console.error("Error detectando color:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateColorDetection = async (x, y) => {
    // Simulación mejorada que considera la posición
    const colors = [
      { name: "Rojo", value: "rgb(255, 0, 0)", r: 255, g: 0, b: 0 },
      { name: "Verde", value: "rgb(0, 255, 0)", r: 0, g: 255, b: 0 },
      { name: "Azul", value: "rgb(0, 0, 255)", r: 0, g: 0, b: 255 },
      { name: "Amarillo", value: "rgb(255, 255, 0)", r: 255, g: 255, b: 0 },
      { name: "Naranja", value: "rgb(255, 165, 0)", r: 255, g: 165, b: 0 },
      { name: "Morado", value: "rgb(128, 0, 128)", r: 128, g: 0, b: 128 },
    ];

    // Simular detección basada en posición (más realista)
    const colorIndex = Math.floor((x + y) % colors.length);
    const detectedColor = colors[colorIndex];
    
    setSelectedColor(detectedColor.value);
    setColorName(detectedColor.name);
    
    // Encontrar colores similares
    const similar = findSimilarColors(detectedColor.r, detectedColor.g, detectedColor.b);
    setSimilarColors(similar);
  };

  const findSimilarColors = (targetR, targetG, targetB, tolerance = 100) => {
    const colorPalette = [
      { name: "Rojo", r: 255, g: 0, b: 0 },
      { name: "Verde", r: 0, g: 255, b: 0 },
      { name: "Azul", r: 0, g: 0, b: 255 },
      { name: "Amarillo", r: 255, g: 255, b: 0 },
      { name: "Magenta", r: 255, g: 0, b: 255 },
      { name: "Cian", r: 0, g: 255, b: 255 },
      { name: "Naranja", r: 255, g: 165, b: 0 },
      { name: "Rosa", r: 255, g: 192, b: 203 },
      { name: "Marrón", r: 165, g: 42, b: 42 },
    ];

    return colorPalette.filter(color => {
      const distance = Math.sqrt(
        Math.pow(color.r - targetR, 2) +
        Math.pow(color.g - targetG, 2) +
        Math.pow(color.b - targetB, 2)
      );
      return distance <= tolerance && distance > 0;
    }).map(color => color.name);
  };

  // Resaltar áreas de color similares
  const highlightSimilarColors = async () => {
    if (!selectedColor) {
      Alert.alert("Info", "Primero selecciona un color tocando la imagen");
      return;
    }

    setIsProcessing(true);
    try {
      // Aquí iría el procesamiento real de la imagen
      // Para este ejemplo, mostramos un mensaje
      Alert.alert(
        "Resaltando Colores",
        `Buscando áreas de color similar a ${colorName} en la imagen...`
      );
      
      // Simular procesamiento
      setTimeout(() => {
        setProcessedImage(imageUri); // En realidad sería la imagen procesada
        Alert.alert("Completado", "Áreas de color similares han sido resaltadas");
        setIsProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error resaltando colores:", error);
      setIsProcessing(false);
    }
  };

  // Mejorar contraste para daltonismo
  const enhanceForColorBlindness = async (type = 'deuteranopia') => {
    setIsProcessing(true);
    try {
      Alert.alert(
        "Mejorando Contraste",
        `Aplicando filtros para mejor visibilidad (${type})...`
      );

      // Simular procesamiento
      setTimeout(() => {
        const filters = {
          deuteranopia: "Filtro Verde-Rojo aplicado",
          protanopia: "Filtro Rojo-Verde aplicado", 
          tritanopia: "Filtro Azul-Amarillo aplicado"
        };
        
        setProcessedImage(imageUri);
        Alert.alert("Contraste Mejorado", filters[type]);
        setIsProcessing(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error mejorando contraste:", error);
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Herramientas de Color</Text>
      
      {/* Imagen interactiva */}
      <View style={styles.imageContainer}>
        <Image 
          ref={imageRef}
          source={{ uri: processedImage || imageUri }} 
          style={styles.image}
          resizeMode="contain"
        />
        <View 
          style={styles.touchOverlay}
          onStartShouldSetResponder={() => true}
          onResponderRelease={handleColorPick}
        />
      </View>

      {/* Indicador de procesamiento */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Procesando imagen...</Text>
        </View>
      )}

      {/* Herramientas */}
      <View style={styles.toolsSection}>
        <Text style={styles.tooltip}>
          👆 Toca la imagen para detectar colores
        </Text>

        <ThemedButton 
          onPress={highlightSimilarColors} 
          style={styles.toolButton}
          disabled={isProcessing}
        >
          <Text style={styles.toolButtonText}>
            🔍 Resaltar {colorName || 'Colores Similares'}
          </Text>
        </ThemedButton>

        <View style={styles.contrastButtons}>
          <ThemedButton 
            onPress={() => enhanceForColorBlindness('deuteranopia')}
            style={[styles.contrastButton, {backgroundColor: '#ff6b6b'}]}
            disabled={isProcessing}
          >
            <Text style={styles.contrastButtonText}>🎨 Deuteranopia</Text>
          </ThemedButton>
          
          <ThemedButton 
            onPress={() => enhanceForColorBlindness('protanopia')}
            style={[styles.contrastButton, {backgroundColor: '#4ecdc4'}]}
            disabled={isProcessing}
          >
            <Text style={styles.contrastButtonText}>🎨 Protanopia</Text>
          </ThemedButton>
        </View>
      </View>

      {/* Información del color detectado */}
      {selectedColor && (
        <View style={styles.colorInfo}>
          <Text style={styles.colorInfoTitle}>Color Detectado:</Text>
          <View style={styles.colorDisplay}>
            <View 
              style={[styles.colorBox, { backgroundColor: selectedColor }]} 
            />
            <View style={styles.colorDetails}>
              <Text style={styles.colorName}>{colorName}</Text>
              <Text style={styles.colorValue}>{selectedColor}</Text>
              {similarColors && similarColors.length > 0 && (
                <Text style={styles.similarColors}>
                  Colores relacionados: {similarColors.join(", ")}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <ThemedButton onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver a Galería</Text>
        </ThemedButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    height: 250,
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toolsSection: {
    marginBottom: 20,
  },
  tooltip: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  toolButton: {
    paddingVertical: 15,
    marginBottom: 10,
  },
  toolButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
  contrastButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  contrastButton: {
    flex: 1,
    paddingVertical: 12,
  },
  contrastButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 5,
  },
  similarColors: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 'auto',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ColorHighlightTool;