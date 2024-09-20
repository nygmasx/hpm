import React from 'react';
import { Image, ImageBackground, SafeAreaView, StatusBar, Text, View, StyleSheet, Dimensions } from "react-native";
import backgrounds from "../../constants/backgrounds";
import CustomButton from "../../components/CustomButton";

const { width, height } = Dimensions.get('window');

const AuthHome = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ImageBackground
                    style={styles.backgroundImage}
                    resizeMode="cover"
                    source={backgrounds.home}
                />
            </View>
            <SafeAreaView style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Suivez votre traçabilité simplement</Text>
                    <Text style={styles.subtitle}>
                        Enjoy these pre-made components and worry only about
                        creating the best product ever.
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Commencer"
                        handlePress={() => navigation.navigate('Login Screen')}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    imageContainer: {
        width: '100%',
        height: height * 0.55, // 55% of screen height, similar to 550 fixed height
    },
    backgroundImage: {
        height: '100%',
    },
    content: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: width * 0.04, // 4% of screen width
        justifyContent: 'center',
    },
    title: {
        fontSize: width * 0.08, // Responsive font size
        fontWeight: '800',
        marginBottom: height * 0.02, // 2% of screen height
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: width * 0.04, // 4% of screen width
        marginVertical: height * 0.02, // 2% of screen height
    },
});

export default AuthHome;