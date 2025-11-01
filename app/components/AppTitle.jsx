import { Text, StyleSheet } from 'react-native'

function AppTitle({ style, children = "Blind Spot" }) {
    return (
        <Text style={[styles.title, style]}>
            {children}
        </Text>
    )
}

const styles = StyleSheet.create({
    title: {
        fontWeight: "bold",
        fontSize: 20,
        textAlign: "center",
    },
})

export default AppTitle