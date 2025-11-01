import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const AssistanceToolsModal = ({ visible, onClose }) => {
  const router = useRouter();

  const openCamera = () => {
    onClose();
    router.push('/camera'); // Tu módulo de cámara con detección de colores
  };

  const openGallery = () => {
    onClose();
    router.push('/gallery'); // Tu módulo de galería para analizar imágenes
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Herramienta</Text>
          <Text style={styles.modalSubtitle}>
            Elige cómo quieres usar la herramienta de asistencia:
          </Text>

          {/* Botón Abrir Galería */}
          <Pressable style={styles.optionButton} onPress={openGallery}>
            <Text style={styles.optionButtonText}>Abrir Galería</Text>
            <Text style={styles.optionDescription}>
              Seleccionar una imagen de tu galería para analizar colores
            </Text>
          </Pressable>

          {/* Botón Acceder a Cámara */}
          <Pressable style={styles.optionButton} onPress={openCamera}>
            <Text style={styles.optionButtonText}>Acceder a Cámara</Text>
            <Text style={styles.optionDescription}>
              Usar la cámara en tiempo real para identificar colores
            </Text>
          </Pressable>

          {/* Botón Volver */}
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Volver</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssistanceToolsModal;