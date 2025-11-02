import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  Modal,
  ActivityIndicator
} from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

// ⚠️ IMPORTANTE: Cambia esta IP por la de tu computadora
const API_URL = 'http://172.18.84.234:5001'; // Servidor de detección de colores

const Camera = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [colorDetectado, setColorDetectado] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.mensaje}>Necesitamos permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.boton} onPress={requestPermission}>
          <Text style={styles.textoBoton}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tomarFotoYDetectarColor = async () => {
    if (!cameraRef.current) return;

    setProcesando(true);
    
    try {
      console.log('📸 Tomando foto...');
      
      // Tomar foto
      const foto = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true
      });

      if (!foto.base64) {
        throw new Error('No se pudo obtener la foto');
      }

      console.log('✅ Foto tomada, detectando color...');

      // Enviar al servidor para detección
      const respuesta = await axios.post(`${API_URL}/detectar-color`, {
        imagen: foto.base64
      });

      console.log('🎨 Color detectado:', respuesta.data);
      
      setColorDetectado(respuesta.data);
      setMostrarResultado(true);

    } catch (error) {
      console.error('Error detectando color:', error);
      Alert.alert('Error', 'No se pudo detectar el color. Verifica la conexión con el servidor.');
    } finally {
      setProcesando(false);
    }
  };

  const toggleCamara = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const cerrarResultado = () => {
    setMostrarResultado(false);
    setColorDetectado(null);
  };

  const verificarConexion = async () => {
    try {
      const respuesta = await axios.get(`${API_URL}/health-camera`);
      Alert.alert('✅ Conexión exitosa', 'Servidor de detección de colores funcionando');
    } catch (error) {
      Alert.alert('❌ Error de conexión', 'No se pudo conectar con el servidor de detección');
    }
  };

  return (
    <View style={styles.container}>
      {/* Vista de la cámara */}
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        {/* Overlay con cruz central */}
        <View style={styles.overlay}>
          <View style={styles.cruzContainer}>
            <View style={styles.lineaHorizontal} />
            <View style={styles.lineaVertical} />
            <View style={styles.puntoCentral} />
          </View>
          
          {/* Instrucciones */}
          <View style={styles.instruccionesOverlay}>
            <Text style={styles.textoInstrucciones}>
              Apunta la cruz al color que quieres identificar
            </Text>
          </View>
        </View>

        {/* Controles */}
        <View style={styles.controles}>
          <TouchableOpacity style={styles.botonSecundario} onPress={toggleCamara}>
            <Text style={styles.textoBoton}>🔄</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.botonCaptura} 
            onPress={tomarFotoYDetectarColor}
            disabled={procesando}
          >
            <View style={styles.circuloCaptura} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.botonSecundario} onPress={verificarConexion}>
            <Text style={styles.textoBoton}>🔍</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Indicador de carga */}
      {procesando && (
        <View style={styles.cargandoOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.textoCargando}>Detectando color...</Text>
        </View>
      )}

      {/* Modal de resultados */}
      <Modal
        visible={mostrarResultado}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {colorDetectado && (
              <>
                <Text style={styles.tituloModal}>🎨 Color Detectado</Text>
                
                {/* Muestra de color */}
                <View 
                  style={[
                    styles.muestraColor,
                    { backgroundColor: colorDetectado.muestra_rgb || '#CCCCCC' }
                  ]} 
                />
                
                <Text style={styles.nombreColor}>
                  {colorDetectado.color.toUpperCase()}
                </Text>
                
                {/* Información detallada */}
                <View style={styles.infoContainer}>
                  <Text style={styles.infoTexto}>
                    RGB: {colorDetectado.rgb}
                  </Text>
                  <Text style={styles.infoTexto}>
                    HEX: {colorDetectado.muestra_rgb}
                  </Text>
                  <Text style={styles.infoTexto}>
                    HSV: {colorDetectado.hsv}
                  </Text>
                  <Text style={styles.infoTexto}>
                    Posición: ({colorDetectado.coordenadas.x}, {colorDetectado.coordenadas.y})
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.botonCerrar} 
                  onPress={cerrarResultado}
                >
                  <Text style={styles.textoBotonCerrar}>Continuar Detectando</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Información de ayuda */}
      <View style={styles.ayuda}>
        <Text style={styles.textoAyuda}>
          Presiona el círculo central para detectar el color
        </Text>
      </View>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mensaje: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cruzContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineaHorizontal: {
    position: 'absolute',
    width: 80,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  lineaVertical: {
    position: 'absolute',
    width: 2,
    height: 80,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  puntoCentral: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  instruccionesOverlay: {
    position: 'absolute',
    top: 100,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  textoInstrucciones: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  controles: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  botonCaptura: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  circuloCaptura: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  botonSecundario: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cargandoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  textoCargando: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tituloModal: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  muestraColor: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#333',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nombreColor: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textTransform: 'capitalize',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 25,
  },
  infoTexto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  botonCerrar: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  textoBotonCerrar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ayuda: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textoAyuda: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
});