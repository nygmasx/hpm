import React from 'react';
import {SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import {Searchbar} from "react-native-paper";
import {AntDesign, MaterialCommunityIcons} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";

const ReceptionProduit = ({navigation}) => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col space-y-4">
                <View style={{gap: "20"}}>
                    <Text className="font-bold text-lg">Produits réceptionnés</Text>
                    <View className="w-full items-center space-x-4 flex-row">
                        <Searchbar className="w-4/6 bg-secondary-100" placeholder="Rechercher un produit"/>
                        <TouchableOpacity
                            className="rounded-full w-[45px] h-[45px] justify-center items-center bg-primary">
                            <MaterialCommunityIcons name="barcode-scan" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="rounded-full w-[45px] h-[45px] justify-center items-center bg-primary">
                            <AntDesign name="plus" size={24} color="white"/>
                        </TouchableOpacity>
                    </View>
                    <View className="mt-2">
                        <TouchableOpacity onPress={() => {
                            navigation.navigate('Détail Produit')
                        }}
                                          className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-4 flex-row">
                            <View>
                                <Text className="font-bold text-lg">Produit 1</Text>
                                <Text className="text-[16px] text-[#71727A]">1kg</Text>
                            </View>
                            <View><AntDesign name="checkcircle" size={24} color="#008170"/></View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie" handlePress={() => navigation.navigate('Reception Final')}/>
            </View>
        </SafeAreaView>
    );
};

export default ReceptionProduit;