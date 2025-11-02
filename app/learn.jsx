import React, { useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { Link, useRouter } from "expo-router";

import Logo from "../assets/images/image.png";
import ThemedButton from "./components/ThemedButton";

const Learn = () => {
  const router = useRouter();

  return (
    <View style={{ 
      flex: 1,
      alignItems: "center",
     }}>
      <Image source={Logo} style={styles.image} />

      <Text style={[styles.title, styles.titlePosition]}>Learn's site</Text>

      <ThemedButton onPress={() => router.push("/chatbot")}>
        <Text style={{ color: 'black', fontSize: 16 }}>Chatbot Daltonismo</Text>
      </ThemedButton>

      <Text style={{ marginTop: 10, marginBottom: 30 }}>Testing if the buttons are made correctly</Text>
    </View>
  );
};
export default Learn;

const styles = StyleSheet.create({
  titlePosition: {
    flex: 1,
    marginVertical: 20,
    justifyContent: "center",
  },

  title: {
    fontWeight: "bold",
    fontSize: 20,
  },

  image: {
    marginVertical: 20,
  },
});
