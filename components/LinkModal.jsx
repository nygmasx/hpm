import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import CreateStackNavigator from "@react-navigation/stack/src/navigators/createStackNavigator";

const Stack = CreateStackNavigator()

const LinkModal = ({ title, link, image, navigation, route }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate(`${route}`)}>
            <ImageBackground source={image} style={styles.background} imageStyle={styles.imageStyle} resizeMode={"cover"}>
                <View style={styles.overlay}>
                    <Text style={styles.title}>{title}</Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 180,
    },
    background: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    imageStyle: {
        borderRadius: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        padding: 16,
    },
});

export default LinkModal;