import React, { useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { useRouter } from "expo-router";

import AppHeader from "./components/AppHeader";
import TabBar from "./components/TabBar";
import ThemedButton from "./components/ThemedButton";

const Test = () => {

  const router = useRouter();

  const press = () => {
    console.log("Texto presionado!");
    router.push("/")
  };

  const start = () => {
    console.log("Texto presionado!");
    router.push("/TestScreen")
  };


  return (
    <View style={{ 
      flex: 1,
      alignItems: "center",
     }}>
      <AppHeader 
        title="Blind Spot"
        headerStyle={{ marginVertical: 45 }}
        titleStyle={{ marginVertical: 10 }}
      />
      
      <Text style={[styles.title, styles.titlePosition]}>Prueba de deteccion</Text>

      <View style={{backgroundColor: '#dadadaff', margin: 30}}>
        <Text style={{ marginTop: 10, paddingHorizontal: 30, paddingTop: 30}}>
          Esta evaluación está diseñada para detectar deficiencias en la percepción del color, comúnmente conocidas como daltonismo.{' '}{'\n'}
          <Text style={styles.bold}>¿En qué consiste?</Text>{'\n'}
          {' '}Verá una serie de placas con círculos de puntos de colores. Dentro de estos patrones, se encuentra oculto un número o una forma. Su tarea es identificar qué ve en cada una de las imágenes.{'\n'}
          Instrucciones:{'\n'}
          -   Observe cada placa con atención.{'\n'}
          -   Seleccione qué número o trayecto (forma) logra distinguir.{'\n'}
          -   No hay un límite de tiempo estricto, pero trate de responder en un lapso razonable.{'\n'}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 10 }}>
          <ThemedButton onPress={start}>
            <Text style={{ color: 'black', fontSize: 16, alignSelf: "center" }}>Aceptar</Text>
          </ThemedButton>

          <ThemedButton onPress={press}>
            <Text style={{ color: 'black', fontSize: 16, alignSelf: "center" }}>Volver</Text>
          </ThemedButton>
        </View>
      </View>

      <TabBar />
    </View>
  );
};
export default Test;

const styles = StyleSheet.create({
  titlePosition: {
    marginVertical: 0,
    justifyContent: "center",
  },

  title: {
    fontWeight: "bold",
    fontSize: 20,
  },

  image: {
    marginVertical: 20,
  },

  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
});
