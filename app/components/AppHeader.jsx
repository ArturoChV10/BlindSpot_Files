import { View, StyleSheet } from 'react-native'
import PurpleHeader from './PurpleHeader'
import AppTitle from './AppTitle'

function AppHeader({ title = "Blind Spot", titleStyle, headerStyle }) {
    return (
        <View style={[styles.headerContainer, headerStyle]}>
            <PurpleHeader style={styles.purpleLine} />
            <AppTitle style={titleStyle}>{title}</AppTitle>
        </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        position: 'relative',
        width: '100%',
    },
    purpleLine: {
        marginVertical: 45,
        position: 'absolute',
    },
})

export default AppHeader