import React, {useContext} from 'react';
import {Button, Image, SafeAreaView, ScrollView, Text, View} from "react-native";
import {AuthContext} from "../context/AuthProvider";
import icons from "../constants/icons";

const Settings = () => {

    const {logout, user} = useContext(AuthContext)
    const SECTIONS = [

    ];

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <ScrollView style={{height: "100%"}}>
                <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col">
                    <View className="w-full justify-center items-center">
                        <View className="w-full items-center space-y-4">
                            <Image source={icons.avatar} />
                            <Text className="text-2xl font-bold">{user.name}</Text>
                        </View>
                    </View>
                    <View>
                        <Button title="Déconnexion" onPress={logout}/>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;