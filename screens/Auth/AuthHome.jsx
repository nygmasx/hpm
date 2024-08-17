import React from 'react';
import {Image, ImageBackground, SafeAreaView, StatusBar, Text, View} from "react-native";
import backgrounds from "../../constants/backgrounds";
import CustomButton from "../../components/CustomButton";

const AuthHome = ({navigation}) => {
    return (
        <View className="flex-1 bg-white">
            <View className="w-full justify-start" style={{height: 550}}>
                <ImageBackground style={{height: "100%"}} resizeMode={"cover"} source={backgrounds.home}>
                </ImageBackground>
            </View>
            <SafeAreaView className="flex-1 bg-white justify-start items-start">
                <View className="w-full flex-1 space-y-6 px-6 justify-center">
                    <Text className="text-3xl font-extrabold">Suivez votre traçabilité simplement</Text>
                    <Text className="text-gray-500 text-[16px] font-medium">
                        Enjoy these pre-made components and worry only about
                        creating the best product ever.
                    </Text>
                </View>
                <View className="w-full px-4 my-3">
                    <CustomButton title="Commencer" handlePress={() => navigation.navigate('Login Screen')}/>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default AuthHome;