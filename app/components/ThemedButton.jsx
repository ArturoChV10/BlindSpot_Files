import { Pressable, StyleSheet } from 'react-native'

function ThemedButton({ style, children, ...props }) {

    return (
        <Pressable
            style={({ pressed }) => [styles.btn, style, pressed && styles.pressed]}
            {...props}
        >
            {children}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: "#f0f0f7ff",
        padding: 10,
        borderRadius: 5,
        margin: 20,
        width: '40%',
        borderWidth: 2,
        borderColor: "#d3ceceff"
    },

    pressed: {
    opacity: 0.5
    },
})

export default ThemedButton