import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";

import Logo from "../assets/images/logo.png";
import Settings from "../assets/images/settings.png";

import ThemedButton from "./components/ThemedButton";
import TabBar from "./components/TabBar";
import AppHeader from './components/AppHeader'

const Home = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState("home");

  const pressTest = () => {
    console.log("Texto presionado!");
    router.push("/test");
  };

  const pressHelp = () => {
    console.log("Texto presionado!");
    router.push("/camera");
  };

  const pressLearn = () => {
    console.log("Texto presionado!");
    router.push("/learn");
  };

  return (
    <View style={[ styles.container, ]}>
      {/*<View style={styles.purpleLine}></View>*/}

      {/*<Text style={[styles.title, styles.titlePosition]}>Blind Spot</Text>*/}

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

      <TabBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
      />
    </View>
  );
};
export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Style para el logo
  styleLogo: {
    alignContent: "center",
    alignSelf: "center",
    marginVertical: 10,
    marginBottom: 30,
  },

  // Style para el icono de configuración
  styleSettings: {
    alignContent: "flex-end",
    alignSelf: "flex-end",
    marginVertical: 125,
    marginRight: 10,
    position: "absolute",
  },

  // Style para el tercer botón (Aprender sobre el daltonismo)
  alignCenterView: {
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
  },

/*

  textButton: {
    padding: 10,
    margin: 20,
    borderRadius: 5,
    backgroundColor: "#f0f0f7ff",
    width: "40%",
  },

  pressedButton: {
    backgroundColor: "#605ec7ff",
    transform: [{ scale: 0.95 }],
  },

  buttonText: {
    color: "black",
    fontSize: 16,
  },

  // Styles para la barra de navegación inferior
  tabBar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },

  activeTab: {
    backgroundColor: "#f0f0f0",
  },

  pressedTab: {
    opacity: 0.7,
  },

  tabIcon: {
    width: 24,
    height: 24,
    tintColor: "#666", // Color por defecto
  },

  activeIcon: {
    tintColor: "#5653ddff", // Color cuando está activo
  },

  btn: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6666d4ff',
  },

  pressed: {
    opacity: 0.8,
  },
*/

});
