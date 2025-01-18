import React from 'react';
import {Image, Text, TouchableOpacity, View, StyleSheet, Dimensions} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import CreateStackNavigator from "@react-navigation/stack/src/navigators/createStackNavigator";
import {NavigationContainer} from "@react-navigation/native";

const {width, height} = Dimensions.get('window');
const scale = Math.min(width, height) / 375; // Base scale for responsiveness
const responsiveSize = (size) => size * scale;

const Stack = CreateStackNavigator()

const ActionModal = ({route, title, icon, subtitle, navigation}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => navigation.navigate(`${route}`)}
        >
            <Ionicons
                name={icon}
                size={responsiveSize(50)}
                color="white"
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: responsiveSize(160), // converted from h-40 (40 * 4 = 160)
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#008170',
        borderRadius: responsiveSize(16),
        paddingHorizontal: responsiveSize(16),
        // Add shadow for better depth perception
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // for Android shadow
    },
    title: {
        fontSize: responsiveSize(24), // text-2xl
        textAlign: 'center',
        fontWeight: '800', // font-extrabold
        color: 'white',
        marginTop: responsiveSize(8),
        includeFontPadding: false,
    },
    subtitle: {
        fontSize: responsiveSize(14), // text-sm
        textAlign: 'center',
        fontWeight: '500', // font-medium
        color: 'white',
        marginTop: responsiveSize(4),
        includeFontPadding: false,
    }
});

// Handle orientation changes
Dimensions.addEventListener('change', () => {
    const {width, height} = Dimensions.get('window');
    scale = Math.min(width, height) / 375;
});

export default ActionModal;