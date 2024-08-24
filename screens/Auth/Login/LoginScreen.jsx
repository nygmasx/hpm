import React, {useContext, useState} from 'react';
import {
    Button,
    ImageBackground, Keyboard,
    KeyboardAvoidingView, Platform,
    SafeAreaView, ScrollView,
    Text,
    Touchable,
    TouchableOpacity, TouchableWithoutFeedback,
    View
} from "react-native";
import backgrounds from "../../../constants/backgrounds";
import CustomButton from "../../../components/CustomButton";
import FormField from "../../../components/FormField";
import {AuthContext} from "../../../context/AuthProvider";

const LoginScreen = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {login, error, isLoading} = useContext(AuthContext);

    return (
        <View className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior="padding"
                style={{flex: 1}}

            >
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        {/* Wrap the content in a single View */}
                        <View style={{ flex: 1 }}>
                            <View className="w-full justify-start" style={{height: 300}}>
                                <ImageBackground style={{height: "100%"}} resizeMode={"cover"} source={backgrounds.cat}>
                                </ImageBackground>
                            </View>
                            <View className="w-full px-6 mt-10">
                                <Text className="text-3xl font-extrabold">Vous avez un compte ?</Text>
                                <View className="space-y-4">
                                    {error && <Text style={{color: 'red'}}>{error}</Text>}
                                    <FormField placeholder="Email" value={email} handleChangeText={setEmail}/>
                                    <FormField placeholder="Mot de passe" value={password} name="Password" handleChangeText={setPassword}/>
                                    <TouchableOpacity>
                                        <Text className="text-[16px] text-primary font-bold">Mot de passe oublié ?</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View className="w-full px-6 my-8 space-y-4">
                                <CustomButton title="Se connecter" handlePress={() => login(email, password)}
                                              isLoading={isLoading}/>
                                <View className="space-y-1">
                                    <View className="w-full flex-row justify-center space-x-1">
                                        <Text className="text-[16px]">Vous êtes nouveau ?</Text>
                                        <TouchableOpacity>
                                            <Text
                                                className="text-[16px] text-center text-primary font-bold">Inscription</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text className="text-center text-[16px] font-bold">
                                        30 jours d’accès gratuit sans engagement
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

export default LoginScreen;