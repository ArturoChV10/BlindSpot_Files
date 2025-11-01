import { StyleSheet, Text, View, Image } from "react-native";

import Logo from "../assets/images/image.png";

const Learn = () => {
  return (
    <View style={{ 
      flex: 1,
      alignItems: "center",
     }}>
      <Image source={Logo} style={styles.image} />

      <Text style={[styles.title, styles.titlePosition]}>Gallery's site</Text>

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
