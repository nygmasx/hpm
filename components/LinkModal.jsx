import React from 'react';
import {ImageBackground, Text, TouchableOpacity, View} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import CreateStackNavigator from "@react-navigation/stack/src/navigators/createStackNavigator";

const Stack = CreateStackNavigator()


const LinkModal = ({title, link, image, navigation, route}) => {


    return (
        <TouchableOpacity className="w-full h-40 flex flex-col" onPress={() => navigation.navigate(`${route}`)}>
            <ImageBackground source={image} className="h-full flex justify-end" imageStyle={{borderRadius: 16}}
                             resizeMode={"cover"}>
                <View className="bg-black/50 flex-1 justify-end" style={{borderRadius: 16}}>
                    <Text className="text-2xl font-bold text-white p-4">{title}</Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

export default LinkModal;