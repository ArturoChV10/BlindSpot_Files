import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import ThemedButton from './ThemedButton';

const RealColorProcessor = ({ imageUri, onBack }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [processedImageUri, setProcessedImageUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const glRef = useRef();

  // Cargar y procesar la imagen original
  useEffect(() => {
    if (imageUri) {
      loadImageSize();
    }
  }, [imageUri]);

  const loadImageSize = async () => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      
      Image.getSize(manipResult.uri, (width, height) => {
        setOriginalImageSize({ width, height });
      });
    } catch (error) {
      console.error('Error loading image size:', error);
    }
  };

  // Procesamiento REAL con WebGL
  const processImageWithGL = async (targetColor, tolerance = 0.2) => {
    if (!glRef.current) return null;

    try {
      const gl = glRef.current;
      
      // Crear textura desde la imagen
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // Configuraciones de textura
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      // Cargar imagen en la textura
      await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          resolve();
        };
        image.onerror = reject;
        image.src = imageUri;
      });

      // Shader para resaltar colores específicos
      const vertexShaderSource = `
        attribute vec2 position;
        varying vec2 vTexCoord;
        void main() {
          vTexCoord = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fragmentShaderSource = `
        precision highp float;
        varying vec2 vTexCoord;
        uniform sampler2D uTexture;
        uniform vec3 uTargetColor;
        uniform float uTolerance;

        void main() {
          vec4 color = texture2D(uTexture, vTexCoord);
          float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          
          // Calcular distancia al color objetivo
          vec3 diff = color.rgb - uTargetColor;
          float colorDistance = length(diff);
          
          // Si está dentro de la tolerancia, mantener el color original
          // Si no, convertir a escala de grises
          if (colorDistance <= uTolerance) {
            gl_FragColor = color;
          } else {
            gl_FragColor = vec4(vec3(luminance), color.a);
          }
        }
      `;

      // Compilar shaders
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);

      // Crear programa
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      // Configurar geometría
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
      ]), gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Pasar uniformes
      const targetColorLocation = gl.getUniformLocation(program, "uTargetColor");
      const toleranceLocation = gl.getUniformLocation(program, "uTolerance");
      
      gl.uniform3f(targetColorLocation, targetColor.r / 255, targetColor.g / 255, targetColor.b / 255);
      gl.uniform1f(toleranceLocation, tolerance);

      // Renderizar
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Leer el resultado
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      // Convertir a base64 para guardar
      const base64 = await glViewToBase64(gl, width, height);
      
      return base64;
    } catch (error) {
      console.error('Error en WebGL processing:', error);
      return null;
    }
  };

  const glViewToBase64 = async (gl, width, height) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      const imageData = context.createImageData(width, height);
      
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      
      // Flip verticalmente (WebGL tiene Y invertido)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcIndex = (y * width + x) * 4;
          const dstIndex = ((height - 1 - y) * width + x) * 4;
          imageData.data[dstIndex] = pixels[srcIndex];     // R
          imageData.data[dstIndex + 1] = pixels[srcIndex + 1]; // G
          imageData.data[dstIndex + 2] = pixels[srcIndex + 2]; // B
          imageData.data[dstIndex + 3] = pixels[srcIndex + 3]; // A
        }
      }
      
      context.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    });
  };

  // Seleccionar color REAL de la imagen
  const handleColorPick = async (event) => {
    if (!imageUri) return;

    try {
      setIsProcessing(true);
      
      // Obtener color real del pixel usando ImageManipulator
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ crop: {
            originX: event.nativeEvent.locationX - 5,
            originY: event.nativeEvent.locationY - 5,
            width: 10,
            height: 10
        }}],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
      );

      // Analizar el color promedio del área seleccionada
      const color = await getAverageColor(manipResult.uri);
      setSelectedColor(color);
      
      Alert.alert(
        'Color Seleccionado',
        `RGB: (${color.r}, ${color.g}, ${color.b})`
      );
      
    } catch (error) {
      console.error('Error seleccionando color:', error);
      Alert.alert('Error', 'No se pudo detectar el color');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAverageColor = async (imageUri) => {
    return new Promise((resolve, reject) => {
      Image.getSize(imageUri, async (width, height) => {
        try {
          // Usar GL para obtener el color promedio
          const glContext = await GLView.createContextAsync();
          const texture = glContext.createTexture();
          
          glContext.bindTexture(glContext.TEXTURE_2D, texture);
          
          const image = new Image();
          image.onload = () => {
            glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, image);
            
            // Leer píxeles
            const pixels = new Uint8Array(width * height * 4);
            glContext.readPixels(0, 0, width, height, glContext.RGBA, glContext.UNSIGNED_BYTE, pixels);
            
            let r = 0, g = 0, b = 0;
            const pixelCount = width * height;
            
            for (let i = 0; i < pixels.length; i += 4) {
              r += pixels[i];
              g += pixels[i + 1];
              b += pixels[i + 2];
            }
            
            resolve({
              r: Math.round(r / pixelCount),
              g: Math.round(g / pixelCount),
              b: Math.round(b / pixelCount)
            });
            
            glContext.destroy();
          };
          
          image.onerror = reject;
          image.src = imageUri;
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  // Resaltar colores REAL
  const highlightSelectedColor = async () => {
    if (!selectedColor) {
      Alert.alert('Info', 'Primero selecciona un color tocando la imagen');
      return;
    }

    setIsProcessing(true);
    try {
      // Procesar la imagen con el color seleccionado
      const processedBase64 = await processImageWithGL(selectedColor, 0.3);
      
      if (processedBase64) {
        // Guardar imagen procesada
        const fileName = FileSystem.documentDirectory + `processed_${Date.now()}.jpg`;
        const base64Data = processedBase64.split(',')[1];
        await FileSystem.writeAsStringAsync(fileName, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        setProcessedImageUri(fileName);
        Alert.alert('Éxito', 'Colores resaltados correctamente');
      }
    } catch (error) {
      console.error('Error procesando imagen:', error);
      Alert.alert('Error', 'No se pudo procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImage = () => {
    setProcessedImageUri(null);
    setSelectedColor(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Procesador Real de Colores</Text>
      
      {/* Vista de imagen */}
      <View style={styles.imageSection}>
        {!processedImageUri ? (
          <View style={styles.imageContainer}>
            <GLView
              ref={glRef}
              style={styles.glView}
              onContextCreate={async (gl) => {
                // Inicializar contexto GL
                glRef.current = gl;
              }}
            />
            <Image 
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <View 
              style={styles.touchOverlay}
              onStartShouldSetResponder={() => true}
              onResponderRelease={handleColorPick}
            />
          </View>
        ) : (
          <Image 
            source={{ uri: processedImageUri }}
            style={styles.processedImage}
            resizeMode="contain"
          />
        )}

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.processingText}>Procesando imagen...</Text>
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
              <Text style={styles.colorValue}>
                R: {selectedColor.r} G: {selectedColor.g} B: {selectedColor.b}
              </Text>
              <Text style={styles.instruction}>
                Toca "Resaltar" para mantener este color y convertir el resto a blanco y negro
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Controles */}
      <View style={styles.controls}>
        <ThemedButton 
          onPress={highlightSelectedColor}
          style={styles.highlightButton}
          disabled={!selectedColor || isProcessing}
        >
          <Text style={styles.highlightButtonText}>
            🎨 Resaltar Color Seleccionado
          </Text>
        </ThemedButton>

        {processedImageUri && (
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
          <Text style={styles.backButtonText}>← Volver</Text>
        </ThemedButton>
      </View>

      <Text style={styles.helpText}>
        👆 Toca cualquier parte de la imagen para seleccionar un color
      </Text>
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
  imageSection: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  glView: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  processedImage: {
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
    marginTop: 10,
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
  colorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  instruction: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  controls: {
    gap: 10,
    marginBottom: 15,
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
  resetButton: {
    paddingVertical: 12,
    backgroundColor: '#FF9800',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
  },
});

export default RealColorProcessor;