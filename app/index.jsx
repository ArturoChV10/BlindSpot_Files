import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";

import Logo from "../assets/images/logo.png";
import Settings from "../assets/images/settings.png";

import ThemedButton from "./components/ThemedButton";
import TabBar from "./components/TabBar";
import AppHeader from './components/AppHeader';
import AssistanceToolsModal from "./components/AssistanceToolsModal"; // Nuevo import

const Home = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal

  const pressTest = () => {
    console.log("Texto presionado!");
    router.push("/test");
  };

  const pressHelp = () => {
    console.log("Herramientas de asistencia presionado!");
    setModalVisible(true); // Abre el modal en lugar de navegar directamente
  };

  const pressLearn = () => {
    console.log("Texto presionado!");
    router.push("/learn");
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Blind Spot"
        headerStyle={{ marginVertical: 45 }}
        titleStyle={{ marginVertical: 10 }}
      />

      <Image source={Settings} style={styles.styleSettings} />
      <Image source={Logo} style={styles.styleLogo} />

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <ThemedButton onPress={pressTest}>
          <Text style={{ color: 'black', fontSize: 16 }}>Realizar prueba de daltonismo</Text>
        </ThemedButton>

        <ThemedButton onPress={pressHelp}>
          <Text style={{ color: 'black', fontSize: 16 }}>Herramientas de asistencia</Text>
        </ThemedButton>
      </View>

      <View style={[styles.alignCenterView, { marginTop: 20 }]}>
        <ThemedButton onPress={pressLearn}>
          <Text style={{ color: 'black', fontSize: 16 }}>Aprender sobre el daltonismo</Text>
        </ThemedButton>
      </View>

      {/* Modal de herramientas de asistencia */}
      <AssistanceToolsModal 
        visible={modalVisible}
        onClose={closeModal}
      />

      <TabBar />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  styleLogo: {
    alignContent: "center",
    alignSelf: "center",
    marginVertical: 10,
    marginBottom: 30,
  },
  styleSettings: {
    alignContent: "flex-end",
    alignSelf: "flex-end",
    marginVertical: 125,
    marginRight: 10,
    position: "absolute",
  },
  alignCenterView: {
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
  },
});