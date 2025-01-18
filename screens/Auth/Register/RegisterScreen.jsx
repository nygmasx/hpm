import React, {useContext, useState, useEffect} from 'react';
import {
    Dimensions,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform, SafeAreaView,
    ScrollView, StyleSheet,
    Text, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import {AuthContext} from "../../../context/AuthProvider";

const {width, height} = Dimensions.get('window');

const RegisterScreen = ({navigation}) => {

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const { register, error, isLoading, resetError } = useContext(AuthContext);

    useEffect(() => {
        return () => {
            resetError();
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.content}>
                            <View style={styles.formContainer}>
                                <Text style={styles.title}>Créez votre compte</Text>
                                <View style={styles.formFields}>
                                    <FormField placeholder="Nom" value={name} handleChangeText={setName}/>
                                    {error && <Text style={styles.errorText}>{error}</Text>}
                                    <FormField placeholder="Email" value={email} handleChangeText={setEmail}/>
                                    <FormField placeholder="Mot de passe" value={password} name="Password"
                                               handleChangeText={setPassword}/>
                                </View>
                            </View>
                            <View style={styles.buttonContainer}>
                                <CustomButton
                                    title="Créer un compte"
                                    handlePress={() => register(name, email, password)}
                                    isLoading={isLoading}
                                />

                                <View style={styles.signupContainer}>
                                    <Text style={styles.cguText}>
                                        En continuant vous indiquez que vous avez lu et approuvé nos{' '}
                                        <Text
                                            style={styles.cguLink}
                                            onPress={() => {/* navigation vers CGU */
                                            }}
                                        >
                                            Conditions d'utilisation
                                        </Text>
                                        {' '}et notre{' '}
                                        <Text
                                            style={styles.cguLink}
                                            onPress={() => {/* navigation vers politique */
                                            }}
                                        >
                                            Politique de Confidentialité
                                        </Text>
                                    </Text>
                                    <View style={styles.signupTextContainer}>
                                        <Text style={styles.signupText}>Vous avez un compte ?</Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('Login Screen')}>
                                            <Text style={styles.signupLink}>Connexion</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
        padding: width * 0.04
    },
    backgroundImage: {
        height: '100%',
    },
    formContainer: {
        width: '100%',
        gap: height * 0.02
    },
    title: {
        fontSize: width * 0.07,
        fontWeight: '800',
    },
    formFields: {
        gap: height * 0.01,
    },
    errorText: {
        color: 'red',
    },
    forgotPasswordContainer: {
        marginTop: height * 0.01
    },
    forgotPassword: {
        fontSize: width * 0.04,
        color: '#008170',
        fontWeight: 'bold',
    },
    buttonContainer: {
        width: '100%',
        marginTop: height * 0.03,
        gap: height * 0.025
    },
    signupContainer: {
        gap: height * 0.01
    },
    signupTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: width * 0.02
    },
    signupText: {
        fontSize: width * 0.04,
    },
    cguText: {
        fontSize: width * 0.03,
        textAlign: "center"
    },
    cguLink: {
        fontSize: width * 0.03,
        textAlign: "center",
        textDecorationLine: "underline"
    },
    signupLink: {
        fontSize: width * 0.04,
        color: '#008170',
        fontWeight: 'bold',
    },
    promoText: {
        textAlign: 'center',
        fontSize: width * 0.04,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;