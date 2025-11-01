// This file was generated in case we need an auxiliary file to save code snippets.

import { StyleSheet, Text, View, Image } from "react-native"

import Logo from '../assets/images/logo.png'

const Home = () => {
    return (
        <View style={styles.container}>

            <Image source={Logo} style = {styles.image}/>

            <Text style = {styles.title}>The number 1</Text>

            <Text style = {{marginTop: 10, marginBottom: 30}}>
                Reading List App
            </Text>
        </View>
    )
}
export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        fontWeight: "bold",
        fontSize: 20,
    },

    image: {
        marginVertical: 20,
    }
})

{/*

    ============================================================
    ============================================================
    ==ESTO ERA LO QUE TENÍA ANTES EN GALLERY, PERO NO FUNCIONA==
    ============================================================
    ============================================================

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import ThemedButton from "./components/ThemedButton";
import TabBar from "./components/TabBar";
import AppHeader from './components/AppHeader';
import OpenCVColorProcessor from "./components/OpenCVColorProcessor"; // NUEVO IMPORT

const Gallery = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showColorTools, setShowColorTools] = useState(false);

  // Solicitar permisos y abrir la galería
  const pickImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu galería para seleccionar imágenes."
        );
        return;
      }

      setIsLoading(true);
      
      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setShowColorTools(true);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu cámara para tomar fotos."
        );
        return;
      }

      setIsLoading(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setShowColorTools(true);
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setShowColorTools(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Galería de Imágenes"
        headerStyle={{ marginVertical: 45 }}
        titleStyle={{ marginVertical: 10 }}
      />

      <View style={styles.content}>
        {!selectedImage ? (
          <View style={styles.selectionSection}>
            <Text style={styles.title}>
              Selecciona o toma una foto para analizar colores con OpenCV
            </Text>
            
            <View style={styles.buttonContainer}>
              <ThemedButton onPress={pickImage} style={styles.button}>
                <Text style={styles.buttonText}>📁 Elegir de Galería</Text>
              </ThemedButton>

              <ThemedButton onPress={takePhoto} style={styles.button}>
                <Text style={styles.buttonText}>📷 Tomar Foto</Text>
              </ThemedButton>
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Cargando...</Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>🚀 Procesamiento con OpenCV</Text>
              <Text style={styles.infoText}>
                Esta función usa un servidor backend con procesamiento avanzado de imágenes.
              </Text>
              <Text style={styles.infoText}>
                Asegúrate de que el servidor esté ejecutándose en:
              </Text>
              <Text style={styles.serverUrl}>http://localhost:3000</Text>
            </View>
          </View>
        ) : (
          <View style={styles.imageSection}>
            {showColorTools ? (
              <OpenCVColorProcessor 
                imageUri={selectedImage}
                onBack={resetSelection}
              />
            ) : (
              <View style={styles.previewSection}>
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <View style={styles.previewButtons}>
                  <ThemedButton onPress={() => setShowColorTools(true)}>
                    <Text>🎨 Procesar con OpenCV</Text>
                  </ThemedButton>
                  <ThemedButton onPress={resetSelection}>
                    <Text>↩️ Elegir otra imagen</Text>
                  </ThemedButton>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      <TabBar />
    </View>
  );
};

export default Gallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  selectionSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  imageSection: {
    flex: 1,
  },
  previewSection: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
    borderRadius: 10,
  },
  previewButtons: {
    gap: 10,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    lineHeight: 18,
  },
  serverUrl: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 4,
    marginTop: 5,
  },
});

*/}