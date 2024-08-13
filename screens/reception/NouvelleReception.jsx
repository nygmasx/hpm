import React from 'react';
import {SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import FormField from "../../components/FormField";
import DateTimeField from "../../components/DateTimeField";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import PictureModal from "../../components/PictureModal";
import CustomButton from "../../components/CustomButton";
import {Chip, Searchbar} from "react-native-paper";

const NouvelleReception = () => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <ScrollView style={{height: "100%"}}>
                <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col space-y-4">
                    <View className="flex-row items-center">
                        <View className="space-y-2">
                            <Text className="font-bold text-lg">Référence Bon de Livraison / Facture</Text>
                            <View className="flex-row w-full items-center space-x-4">
                                <View
                                    className="border-[1px] border-secondary w-5/6 h-16 px-4 rounded-[12px] focus:border-primary items-center flex-row">
                                    <TextInput
                                        className="flex-1 font-medium text-[18px] h-full w-full"
                                        placeholderTextColor="#7b7b8b"
                                    />
                                </View>
                                <TouchableOpacity
                                    className="bg-primary rounded-full items-center justify-center w-[45px] h-[45px]">
                                    <FontAwesome name="camera" size={22} color="white"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <DateTimeField title="Date de livraison"/>

                    <View className="space-y-4">
                        <Text className="font-bold text-lg">Durant quel service ?</Text>
                        <View className="flex-row" style={{gap: 10}}>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Matin</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Midi</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Soir</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Indifférent</Chip>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie"/>
            </View>
        </SafeAreaView>
    );
};

export default NouvelleReception;