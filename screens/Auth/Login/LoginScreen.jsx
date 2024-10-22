import React, { useContext, useState } from 'react';
import {
    Button,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    Dimensions
} from "react-native";
import backgrounds from "../../../constants/backgrounds";
import CustomButton from "../../../components/CustomButton";
import FormField from "../../../components/FormField";
import { AuthContext } from "../../../context/AuthProvider";

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.content}>
                            <View style={styles.imageContainer}>
                                <ImageBackground
                                    style={styles.backgroundImage}
                                    resizeMode="cover"
                                    source={backgrounds.cat}
                                />
                            </View>
                            <View style={styles.formContainer}>
                                <Text style={styles.title}>Vous avez un compte ?</Text>
                                <View style={styles.formFields}>
                                    {error && <Text style={styles.errorText}>{error}</Text>}
                                    <FormField placeholder="Email" value={email} handleChangeText={setEmail}/>
                                    <FormField placeholder="Mot de passe" value={password} name="Password" handleChangeText={setPassword}/>
                                </View>
                                <TouchableOpacity>
                                    <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonContainer}>
                                <CustomButton
                                    title="Se connecter"
                                    handlePress={() => login(email, password)}
                                    isLoading={isLoading}
                                />
                                <View style={styles.signupContainer}>
                                    <View style={styles.signupTextContainer}>
                                        <Text style={styles.signupText}>Vous êtes nouveau ?</Text>
                                        <TouchableOpacity>
                                            <Text style={styles.signupLink}>Inscription</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.promoText}>
                                        30 jours d'accès gratuit sans engagement
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        gap: height * 0.04, // Added gap between main content sections
    },
    imageContainer: {
        width: '100%',
        height: height * 0.3,
    },
    backgroundImage: {
        height: '100%',
    },
    formContainer: {
        width: '100%',
        paddingHorizontal: width * 0.04,
        gap: height * 0.02, // Added gap between title and form fields
    },
    title: {
        fontSize: width * 0.08,
        fontWeight: '800',
    },
    formFields: {
        gap: height * 0.01, // Added gap between form fields
    },
    errorText: {
        color: 'red',
    },
    forgotPassword: {
        fontSize: 16,
        color: '#008170',
        fontWeight: 'bold',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: width * 0.04,
        gap: height * 0.02,
    },
    signupContainer: {
        gap: height * 0.01,
    },
    signupTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: width * 0.02,
    },
    signupText: {
        fontSize: 16,
    },
    signupLink: {
        fontSize: 16,
        color: '#008170',
        fontWeight: 'bold',
    },
    promoText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;