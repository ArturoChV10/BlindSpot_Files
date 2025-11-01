import React from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

// Importa tus iconos
import HomeIcon from '../../assets/images/home.png';
import TestIcon from '../../assets/images/test.png';
import CameraIcon from '../../assets/images/camera.png';
import LearnIcon from '../../assets/images/learn.png';

const TabBar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const tabButtons = [
        { 
            id: 'home', 
            icon: HomeIcon, 
            route: '/',
            label: 'Inicio',
            hint: 'Navegar a la pantalla de inicio'
        },
        { 
            id: 'test', 
            icon: TestIcon, 
            route: '/test',
            label: 'Test de Daltonismo',
            hint: 'Realizar test de daltonismo'
        },
        { 
            id: 'camera', 
            icon: CameraIcon, 
            route: '/camera',
            label: 'Cámara',
            hint: 'Abrir cámara para detección de colores'
        },
        { 
            id: 'learn', 
            icon: LearnIcon, 
            route: '/learn',
            label: 'Aprender',
            hint: 'Aprender sobre daltonismo'
        },
    ];

    const handleTabPress = (route) => {
        router.push(route);
    };

    const isTabActive = (route) => {
        return pathname === route;
    };

    return (
        <View 
            style={styles.tabBar}
            accessibilityRole="tablist"
            accessibilityLabel="Navegación principal de la aplicación"
        >
            {tabButtons.map((tab) => (
                <Pressable
                    key={tab.id}
                    onPress={() => handleTabPress(tab.route)}
                    style={({ pressed }) => [
                        styles.tabButton,
                        isTabActive(tab.route) && styles.activeTab,
                        pressed && styles.pressedTab
                    ]}
                    accessibilityRole="tab"
                    accessibilityLabel={tab.label}
                    accessibilityHint={tab.hint}
                    accessibilityState={{
                        selected: isTabActive(tab.route)
                    }}
                >
                    <Image 
                        source={tab.icon} 
                        style={[
                            styles.tabIcon,
                            isTabActive(tab.route) && styles.activeIcon
                        ]} 
                        accessible={false} // Evita que el icono sea leído por separado
                    />
                </Pressable>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },

    activeTab: {
        backgroundColor: '#f0f0f0',
    },

    pressedTab: {
        opacity: 0.7,
    },

    tabIcon: {
        width: 24,
        height: 24,
        tintColor: '#666',
    },

    activeIcon: {
        tintColor: '#5653ddff',
    },
});

export default TabBar;