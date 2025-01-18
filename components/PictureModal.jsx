import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import backgrounds from "../constants/backgrounds";

const { width, height } = Dimensions.get('window');
const scale = Math.min(width, height) / 375;
const responsiveSize = (size) => size * scale;

const PictureModal = ({image, imageName, imageSize}) => {
    return (
        <TouchableOpacity style={styles.container}>
            <Image
                source={{uri: image}}
                style={styles.image}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{imageName}</Text>
                <Text style={styles.subtitle}>{imageSize}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#secondary', // Replace with your secondary color
        width: '100%',
        height: responsiveSize(112), // 28 * 4 = 112
        borderRadius: responsiveSize(16),
        flexDirection: 'row'
    },
    image: {
        width: '33.33%', // w-1/3
        height: '100%',
        borderTopLeftRadius: responsiveSize(16),
        borderBottomLeftRadius: responsiveSize(16)
    },
    infoContainer: {
        width: '66.67%', // w-2/3
        backgroundColor: '#secondary-200', // Replace with your secondary-200 color
        borderTopRightRadius: responsiveSize(16),
        borderBottomRightRadius: responsiveSize(16),
        padding: responsiveSize(16),
        gap: responsiveSize(5)
    },
    title: {
        fontWeight: 'bold',
        fontSize: responsiveSize(18),
        includeFontPadding: false
    },
    subtitle: {
        fontSize: responsiveSize(16),
        color: '#71727A',
        includeFontPadding: false
    }
});

export default PictureModal;