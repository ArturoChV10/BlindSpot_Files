import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from 'axios';
import TabBar from "./components/TabBar";

const API_URL = 'http://172.18.110.104:5002';

const Chatbot = () => {
  const [mensaje, setMensaje] = useState('');
  const [conversacion, setConversacion] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setConversacion([{
      tipo: 'bot',
      texto: '¡Hola! Soy tu asistente especializado en daltonismo. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }]);
  }, []);

  const enviarMensaje = async () => {
    if (!mensaje.trim() || enviando) return;

    const mensajeUsuario = mensaje.trim();
    setMensaje('');
    
    setConversacion(prev => [...prev, {
      tipo: 'usuario',
      texto: mensajeUsuario,
      timestamp: new Date()
    }]);
    
    setEnviando(true);

    try {
      const respuesta = await axios.post(`${API_URL}/chat`, {
        mensaje: mensajeUsuario
      });

      setConversacion(prev => [...prev, {
        tipo: 'bot',
        texto: respuesta.data.respuesta,
        timestamp: new Date()
      }]);

    } catch (error) {
      setConversacion(prev => [...prev, {
        tipo: 'bot',
        texto: '❌ Error de conexión. Verifica que el servidor esté ejecutándose.',
        timestamp: new Date()
      }]);
    } finally {
      setEnviando(false);
    }
  };

  const limpiarChat = () => {
    Alert.alert(
      "Limpiar conversación",
      "¿Estás seguro de que quieres limpiar toda la conversación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Limpiar", 
          onPress: () => {
            setConversacion([{
              tipo: 'bot',
              texto: '¡Hola! Soy tu asistente especializado en daltonismo. ¿En qué puedo ayudarte?',
              timestamp: new Date()
            }]);
          }
        }
      ]
    );
  };

  const verificarConexion = async () => {
    try {
      await axios.get(`${API_URL}/health-chat`);
      Alert.alert('✅ Conectado', 'Chatbot funcionando');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo conectar con el servidor');
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [conversacion]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🤖 Asistente Daltonismo</Text>
        <View style={styles.botonesHeader}>
          <TouchableOpacity 
            style={styles.botonHeader}
            onPress={verificarConexion}
            accessible={true}
            accessibilityLabel="Verificar conexión con el servidor"
            accessibilityHint="Comprueba si el chatbot está conectado y funcionando"
          >
            <Text style={styles.textoBotonHeader}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.botonHeader}
            onPress={limpiarChat}
            accessible={true}
            accessibilityLabel="Limpiar conversación"
            accessibilityHint="Borra todo el historial del chat y comienza una nueva conversación"
          >
            <Text style={styles.textoBotonHeader}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENIDO PRINCIPAL CON MARGEN PARA TABBAR */}
      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.conversacionContainer}
          ref={scrollViewRef}
          contentContainerStyle={styles.conversacionContent}
        >
          {conversacion.map((msg, index) => (
            <View 
              key={index} 
              style={[
                styles.mensajeBurbuja,
                msg.tipo === 'usuario' ? styles.mensajeUsuario : styles.mensajeBot
              ]}
              accessible={true}
              accessibilityLabel={msg.tipo === 'usuario' ? 'Tú dijiste' : 'Asistente respondió'}
              accessibilityHint={msg.texto}
            >
              <Text style={[
                styles.textoMensaje,
                msg.tipo === 'usuario' ? styles.textoMensajeUsuario : styles.textoMensajeBot
              ]}>
                {msg.texto}
              </Text>
            </View>
          ))}
          
          {enviando && (
            <View 
              style={[styles.mensajeBurbuja, styles.mensajeBot]}
              accessible={true}
              accessibilityLabel="El asistente está escribiendo"
            >
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={[styles.textoMensaje, styles.textoMensajeBot]}>
                Procesando...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ÁREA DE ENTRADA */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={mensaje}
            onChangeText={setMensaje}
            placeholder="Escribe tu pregunta sobre daltonismo..."
            placeholderTextColor="#999"
            multiline
            onSubmitEditing={enviarMensaje}
            returnKeyType="send"
            accessible={true}
            accessibilityLabel="Campo para escribir mensaje"
            accessibilityHint="Escribe tu pregunta sobre daltonismo y presiona enviar"
          />
          
          <TouchableOpacity 
            style={[
              styles.botonEnviar,
              (!mensaje.trim() || enviando) && styles.botonEnviarDeshabilitado
            ]}
            onPress={enviarMensaje}
            disabled={!mensaje.trim() || enviando}
            accessible={true}
            accessibilityLabel="Enviar mensaje"
            accessibilityHint={!mensaje.trim() ? 
              "Botón deshabilitado, escribe un mensaje primero" : 
              "Envía tu pregunta al asistente de daltonismo"
            }
            accessibilityRole="button"
          >
            <Text style={styles.textoBotonEnviar}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TabBar />
    </View>
  );
};

export default Chatbot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    height: 60,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  botonesHeader: {
    flexDirection: 'row',
  },
  botonHeader: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  textoBotonHeader: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  // CONTENEDOR PRINCIPAL QUE DEJA ESPACIO PARA EL TABBAR
  contentWrapper: {
    flex: 1,
    marginBottom: 60, // ← MARGEN PARA EL TABBAR ABSOLUTO (misma altura del TabBar)
  },
  conversacionContainer: {
    flex: 1,
  },
  conversacionContent: {
    padding: 16,
    paddingBottom: 20, // Espacio extra al final del scroll
  },
  mensajeBurbuja: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  mensajeUsuario: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  mensajeBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  textoMensaje: {
    fontSize: 16,
    lineHeight: 20,
  },
  textoMensajeUsuario: {
    color: '#FFFFFF',
  },
  textoMensajeBot: {
    color: '#333333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    // Ya no necesita posición absoluta porque el contenedor tiene margen
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  botonEnviar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEnviarDeshabilitado: {
    backgroundColor: '#CCC',
  },
  textoBotonEnviar: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});