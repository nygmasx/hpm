import React, {useState} from 'react';
import {SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {FontAwesome, Ionicons} from "@expo/vector-icons";
import CounterInput from "react-native-counter-input";
import PictureModal from "../../../components/PictureModal";
import CustomButton from "../../../components/CustomButton";

const DetailProduit = () => {

    const [dlc, setDlc] = useState(new Date())

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6 h-full flex-col space-y-4">
                <Text className="font-bold text-lg">Date limite de consommation</Text>
                <View
                    className="border-[1px] flex space-x-2 border-secondary w-4/7 h-16 px-4 rounded-[12px] focus:border-primary justify-center items-center flex-row">
                    <RNDateTimePicker className="text-center" mode="date" value={dlc} display="compact"/>
                    <Ionicons className=" right-0" name="calendar-clear" size={24} color="#008170"/>
                </View>
                <Text className="font-bold text-lg">Quantité consommée</Text>
                <CounterInput
                    horizontal={true}
                    increaseButtonBackgroundColor="#008170"
                    decreaseButtonBackgroundColor="#008170"
                    className="w-full rounded-xl h-16 border-[1px] border-secondary shadow-none"
                    min="0"
                />
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
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie"/>
            </View>
        </SafeAreaView>
    );
};

export default DetailProduit;