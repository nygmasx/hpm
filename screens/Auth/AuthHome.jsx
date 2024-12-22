import React from 'react';
import {Image, ImageBackground, SafeAreaView, StatusBar, Text, View, StyleSheet, Dimensions} from "react-native";
import backgrounds from "../../constants/backgrounds";
import images from "../../constants/images";
import CustomButton from "../../components/CustomButton";

const {width, height} = Dimensions.get('window');

const AuthHome = ({navigation}) => {
    return (
        <SafeAreaView style={styles.content}>
            <View style={{height: "60%", backgroundColor: '#008170', alignItems: 'center'}}>
                <View>
                    <Image source={images.mobileScreens} style={styles.mobileScreens} resizeMode={"contain"}/>
                    <Image source={images.whiteLogo} style={styles.logo} resizeMode={"contain"}/>
                </View>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>Suivez votre traçabilité simplement</Text>
                <Text style={styles.subtitle}>
                    Gérez, Tracez,
                    Sécurisez et Gardez le contrôle.
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <CustomButton
                    title="Commencer"
                    handlePress={() => navigation.navigate('Login Screen')}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: 'white',
    },
    logo: {
        width: width * 0.8,
        height: width * 0.15, // Maintain aspect ratio
        marginBottom: height * 0.02,
    },
    mobileScreens: {
        width: width * 0.8,
        height: width, // Maintain aspect ratio
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