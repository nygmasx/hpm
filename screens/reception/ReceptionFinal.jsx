import React from 'react';
import {SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import {Searchbar} from "react-native-paper";
import {AntDesign, FontAwesome, MaterialCommunityIcons} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";

const ReceptionProduit = () => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col space-y-4">
                <View className="border-[1px] border-secondary rounded-2xl p-4 space-y-4">
                    <Text className="text-center text-lg font-bold">Livraison non conforme ?</Text>
                    <View className="space-y-3">
                        <TouchableOpacity
                            className="bg-primary w-full items-center justify-between rounded-2xl p-5 flex-row">
                            <Text className="text-lg text-white">Horaire non respecté</Text>
                            <FontAwesome name="camera" size={22} color="white"/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-5 flex-row">
                            <Text className="text-lg">Date non respectée</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-5 flex-row">
                            <Text className="text-lg">Prix non conforme</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-5 flex-row">
                            <Text className="text-lg">Quantitée non conforme</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-5 flex-row">
                            <Text className="text-lg">Autre</Text>
                        </TouchableOpacity>


                    </View>
                </View>
            </View>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton
                    title="Finaliser la réception"
                    handlePress={() => navigation.navigate('Reception Produit')}
                />
            </View>
        </SafeAreaView>
    );
};

export default ReceptionProduit;