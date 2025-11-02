import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert 
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import TabBar from "./components/TabBar"; // Importa el TabBar

// ⚠️ IMPORTANTE: Cambia esta IP por la de tu computadora
const API_URL = 'http://172.18.84.234:5000'; // Tu IP local

const Gallery = () => {
  const [imagen, setImagen] = useState(null);
  const [imagenProcesada, setImagenProcesada] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState('rojo');

  const seleccionarImagen = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la galería');
        return;
      }

      // Abrir galería
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        setImagen(resultado.assets[0].uri);
        setImagenProcesada(null); // Resetear imagen procesada
        console.log('Imagen seleccionada:', resultado.assets[0].uri);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const procesarImagen = async (color) => {
    if (!imagen) {
      Alert.alert('Error', 'Primero selecciona una imagen');
      return;
    }

    setProcesando(true);
    setColorSeleccionado(color);

    try {
      // Crear FormData para enviar al servidor
      const formData = new FormData();
      
      // Obtener el nombre del archivo desde la URI
      const filename = imagen.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('imagen', {
        uri: imagen,
        type: type,
        name: filename || 'imagen.jpg',
      });
      formData.append('color', color);

      console.log('Enviando imagen al servidor Python...');

      // Enviar al servidor Python - SIN responseType: 'blob'
      const respuesta = await axios.post(`${API_URL}/procesar-imagen`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('○ Respuesta recibida del servidor');

      // El servidor debería devolver la imagen directamente
      // Pero necesitamos manejarla de manera diferente en React Native
      
      // Para debugging, mostramos información de la respuesta
      console.log('Tipo de respuesta:', typeof respuesta.data);
      console.log('Headers:', respuesta.headers);
      
      // Si la respuesta es binaria, la guardamos como archivo temporal
      if (respuesta.data) {
        // Crear un nombre único para el archivo procesado
        const nombreArchivo = `imagen_procesada_${color}_${Date.now()}.jpg`;
        const rutaArchivo = `${FileSystem.cacheDirectory}${nombreArchivo}`;
        
        // Convertir la respuesta a base64 y guardar
        // Nota: Esto puede necesitar ajustes dependiendo de cómo axios maneje la respuesta
        const base64Data = `data:image/jpeg;base64,${respuesta.data}`;
        
        // Guardar el archivo
        await FileSystem.writeAsStringAsync(rutaArchivo, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        setImagenProcesada(rutaArchivo);
        console.log('○ Imagen procesada guardada en:', rutaArchivo);
      } else {
        throw new Error('No se recibieron datos de la imagen procesada');
      }

    } catch (error) {
      console.error('Error procesando imagen:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Error', 'Tiempo de espera agotado. Verifica que el servidor Python esté ejecutándose.');
      } else if (error.response) {
        Alert.alert('Error', `Error del servidor: ${error.response.status} - ${error.response.data?.error || 'Error desconocido'}`);
      } else {
        Alert.alert('Error', `No se pudo procesar la imagen: ${error.message}`);
      }
    } finally {
      setProcesando(false);
    }
  };

  // Versión alternativa usando fetch en lugar de axios
  const procesarImagenConFetch = async (color) => {
    if (!imagen) {
      Alert.alert('Error', 'Primero selecciona una imagen');
      return;
    }

    setProcesando(true);
    setColorSeleccionado(color);

    try {
      // Crear FormData
      const formData = new FormData();
      const filename = imagen.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('imagen', {
        uri: imagen,
        type: type,
        name: filename || 'imagen.jpg',
      });
      formData.append('color', color);

      console.log('Enviando imagen al servidor Python con fetch...');

      // Usar fetch en lugar de axios
      const respuesta = await fetch(`${API_URL}/procesar-imagen`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      console.log('○ Respuesta recibida, convirtiendo a blob...');

      // Convertir a blob
      const blob = await respuesta.blob();
      
      // Crear URL local para el blob
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64data = reader.result;
          setImagenProcesada(base64data);
          console.log('○ Imagen procesada cargada correctamente');
          resolve();
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error('Error procesando imagen con fetch:', error);
      Alert.alert('Error', `No se pudo procesar la imagen: ${error.message}`);
    } finally {
      setProcesando(false);
    }
  };

  // Función mejorada que prueba ambos métodos
  const procesarImagenMejorado = async (color) => {
    console.log(`Intentando procesar imagen con color: ${color}`);
    
    // Primero intentar con fetch
    try {
      await procesarImagenConFetch(color);
    } catch (error) {
      console.log('Fetch falló, intentando con axios...');
      // Si fetch falla, intentar con axios
      await procesarImagen(color);
    }
  };

  const verificarConexion = async () => {
    try {
      const respuesta = await axios.get(`${API_URL}/health`);
      console.log('○ Respuesta health:', respuesta.data);
      Alert.alert('○ Conexión exitosa', 'El servidor Python está funcionando correctamente');
    } catch (error) {
      console.error('Error verificando conexión:', error);
      Alert.alert('Error de conexión', 
        'No se pudo conectar con el servidor Python. Verifica:\n\n1. Que el servidor esté ejecutándose\n2. Que la IP sea correcta\n3. Que ambos dispositivos estén en la misma red');
    }
  };

  return (
    <View style={styles.container}>
      {/* Contenido principal con ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Módulo de galería</Text>
        <Text style={styles.subtitle}>Resaltador de Colores</Text>

        {/* Botón de verificación de conexión */}
        <TouchableOpacity style={styles.botonVerificar} onPress={verificarConexion}>
          <Text style={styles.textoBoton}>Verificar conexión con python</Text>
        </TouchableOpacity>

        {/* Botón para seleccionar imagen */}
        <TouchableOpacity style={styles.botonPrincipal} onPress={seleccionarImagen}>
          <Text style={styles.textoBoton}>Seleccionar imagen de galería</Text>
        </TouchableOpacity>

        {/* Mostrar imagen original */}
        {imagen && (
          <View style={styles.seccionImagen}>
            <Text style={styles.seccionTitulo}>Imagen Original</Text>
            <Image source={{ uri: imagen }} style={styles.imagen} />
          </View>
        )}

        {/* Botones de procesamiento */}
        {imagen && (
          <View style={styles.seccionProcesamiento}>
            <Text style={styles.seccionTitulo}>Resaltar Color:</Text>
            
            <View style={styles.contenedorBotones}>
              <TouchableOpacity 
                style={[
                  styles.botonColor, 
                  colorSeleccionado === 'rojo' && styles.botonColorSeleccionado,
                  procesando && styles.botonDeshabilitado
                ]}
                onPress={() => procesarImagenMejorado('rojo')}
                disabled={procesando}
              >
                <Text style={[
                  styles.textoBotonColor,
                  colorSeleccionado === 'rojo' && styles.textoBotonSeleccionado
                ]}>
                  🔴 Rojos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.botonColor, 
                  colorSeleccionado === 'verde' && styles.botonColorSeleccionado,
                  procesando && styles.botonDeshabilitado
                ]}
                onPress={() => procesarImagenMejorado('verde')}
                disabled={procesando}
              >
                <Text style={[
                  styles.textoBotonColor,
                  colorSeleccionado === 'verde' && styles.textoBotonSeleccionado
                ]}>
                  🟢 Verdes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.botonColor, 
                  colorSeleccionado === 'azul' && styles.botonColorSeleccionado,
                  procesando && styles.botonDeshabilitado
                ]}
                onPress={() => procesarImagenMejorado('azul')}
                disabled={procesando}
              >
                <Text style={[
                  styles.textoBotonColor,
                  colorSeleccionado === 'azul' && styles.textoBotonSeleccionado
                ]}>
                  🔵 Azules
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Indicador de carga */}
        {procesando && (
          <View style={styles.contenedorCarga}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.textoCarga}>Procesando imagen con Python...</Text>
          </View>
        )}

        {/* Mostrar imagen procesada */}
        {imagenProcesada && (
          <View style={styles.seccionImagen}>
            <Text style={styles.seccionTitulo}>
              Imagen Procesada ({colorSeleccionado.toUpperCase()})
            </Text>
            <Image 
              source={{ uri: imagenProcesada }} 
              style={styles.imagen} 
              onError={(e) => console.log('Error cargando imagen:', e.nativeEvent.error)}
            />
            <Text style={styles.textoInfo}>
              ✅ Color {colorSeleccionado} resaltado correctamente
            </Text>
          </View>
        )}

{/* Información de debug
        <View style={styles.debugInfo}>
          <Text style={styles.debugTitulo}>🔧 Información de Debug:</Text>
          <Text style={styles.debugTexto}>Servidor: {API_URL}</Text>
          <Text style={styles.debugTexto}>Estado: {procesando ? 'Procesando...' : 'Listo'}</Text>
          <Text style={styles.debugTexto}>Imagen original: {imagen ? '✓' : '✗'}</Text>
          <Text style={styles.debugTexto}>Imagen procesada: {imagenProcesada ? '✓' : '✗'}</Text>
        </View>
*/}
        {/* Instrucciones */}
        <View style={styles.instrucciones}>
          <Text style={styles.instruccionesTitulo}>💡 Cómo usar:</Text>
          <Text style={styles.instruccionesTexto}>
            1. Presiona "Verificar Conexión"{'\n'}
            2. Selecciona una imagen{'\n'}
            3. Elige un color para resaltar{'\n'}
            4. Cabmia de color resaltado si es necesario
          </Text>
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
};

export default Gallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30, // Espacio extra para que no quede pegado al TabBar
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  botonPrincipal: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botonVerificar: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 2,
  },
  textoBoton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  seccionImagen: {
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  imagen: {
    width: 280,
    height: 280,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  seccionProcesamiento: {
    marginVertical: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  contenedorBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  botonColor: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  botonColorSeleccionado: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBotonColor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  textoBotonSeleccionado: {
    color: 'white',
  },
  contenedorCarga: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  textoCarga: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  textoInfo: {
    marginTop: 10,
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
    fontWeight: '500',
  },
  debugInfo: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  debugTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#856404',
  },
  debugTexto: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  instrucciones: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  instruccionesTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0056b3',
  },
  instruccionesTexto: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});