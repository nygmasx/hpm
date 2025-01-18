import React from 'react';
import {ActivityIndicator, Text, View, TouchableOpacity, StyleSheet, Dimensions} from "react-native";

const {width, height} = Dimensions.get('window');
const scale = Math.min(width, height) / 375;
const responsiveSize = (size) => size * scale;

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading}) => {
    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[
                styles.container,
                isLoading && styles.loadingState,
                containerStyles
            ]}
            activeOpacity={0.7}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator
                    style={styles.loader}
                    size="large"
                    color="white"
                />
            ) : (
                <Text style={[styles.buttonText, textStyles]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#008170', // Replace with your actual primary color
        borderRadius: responsiveSize(12), // rounded-xl
        minHeight: responsiveSize(62),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: responsiveSize(16),
        // Add shadow for better depth perception
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3, // for Android shadow
    },
    loadingState: {
        opacity: 0.5
    },
    buttonText: {
        color: 'white',
        fontSize: responsiveSize(18), // text-lg
        fontWeight: '600', // font-semibold
        includeFontPadding: false,
        textAlign: 'center',
    },
    loader: {
        marginRight: responsiveSize(18)
    }
});

// Handle orientation changes
Dimensions.addEventListener('change', () => {
    const {width, height} = Dimensions.get('window');
    scale = Math.min(width, height) / 375;
});

export default CustomButton;