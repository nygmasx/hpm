import React from "react";
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import FormField from "../../components/FormField";
import Toast from "react-native-toast-message";
import DateTimeField from "../../components/DateTimeField";
import {Icon} from "@rneui/base";
import {Ionicons} from "@expo/vector-icons";
import {FontAwesome} from '@expo/vector-icons';
import CustomButton from "../../components/CustomButton";
import PictureModal from "../../components/PictureModal";

const TracabiliteSimple = ({navigation}) => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <ScrollView style={{height: "100%"}}>
                <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col" style={{gap: 20}}>
                    <FormField title="Nom du produit"/>
                    <DateTimeField title="Date d’ouverture du/des produit(s)"/>
                    <View style={{gap: "20"}}>
                        <Text className="font-bold text-lg">Photos de l'étiquette</Text>
                        <View className="items-end">
                            <TouchableOpacity className="p-2 bg-primary rounded-xl items-center flex-row">
                                <FontAwesome name="camera" size="20" color="white"/>
                                <Text className="text-white font-bold ml-2">Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="mt-2">
                            <PictureModal/>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie"/>
            </View>
        </SafeAreaView>
    )
}

export default TracabiliteSimple