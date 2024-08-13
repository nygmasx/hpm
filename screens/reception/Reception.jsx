import React from 'react';
import {ImageBackground, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import ActionModal from "../../components/ActionModal";
import {Divider} from "@rneui/themed";
import backgrounds from "../../constants/backgrounds";
import {FontAwesome6, Ionicons} from "@expo/vector-icons";

const Reception = ({navigation}) => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6" style={{gap: 20}}>
                <TouchableOpacity
                    className="w-full h-40 items-center justify-center flex flex-col bg-[#008170] rounded-[16px]"
                    onPress={() => navigation.navigate("Nouvelle Reception")}>
                    <FontAwesome6 name="truck-fast" size={45} color="white"/>
                    <Text className="text-2xl text-center font-extrabold text-white">Nouvelle réception</Text>
                    <Text className="text-sm text-center font-medium text-white">Enregistrer un nouveau contrôle à la
                        réception</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="w-full h-40 items-center justify-center flex flex-col bg-[#008170] rounded-[16px]"
                    onPress={() => navigation.navigate(`${route}`)}>
                    <FontAwesome6 name="truck-fast" size={45} color="white"/>
                    <Text className="text-2xl text-center font-extrabold text-white">Réception(s) en cours</Text>
                    <Text className="text-sm text-center font-medium text-white">Finaliser les réceptions en
                        suspens</Text>
                </TouchableOpacity>
                <Divider/>
            </View>
            <View className="w-full flex-1 items-center">
                <Text className="text-2xl font-extrabold">Historique des réceptions</Text>
                <Text className="text-md font-medium">Consultez l’historique des réceptions effectuées</Text>
                <View className="w-full flex-1 px-4 my-6">
                    <TouchableOpacity className="h-36 flex flex-col"
                                      onPress={() => navigation.navigate("Tracabilite Simple")}>
                        <ImageBackground className="w-full h-full flex justify-end" source={backgrounds.reception}
                                         imageStyle={{borderRadius: 16}}
                                         resizeMode={"cover"}>
                            <View className="w-full bg-black/50 flex-1 justify-end p-3" style={{borderRadius: 16}}>
                                <TouchableOpacity className="w-36 items-center bg-[#008170] rounded-3xl p-2">
                                    <Text className="text-white text-lg font-semibold uppercase">Consulter</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default Reception;