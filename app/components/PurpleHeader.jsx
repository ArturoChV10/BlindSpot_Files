import { View, StyleSheet } from 'react-native'

function PurpleHeader({ style, height = 28 }) {
    return (
        <View style={[styles.purpleLine, { height }, style]} />
    )
}

const styles = StyleSheet.create({
    purpleLine: {
        backgroundColor: '#5653ddff',
        width: '100%',
    },
})

export default PurpleHeader