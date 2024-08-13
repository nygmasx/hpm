import React, {useState} from 'react';
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {FontAwesome, Ionicons} from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomButton from "../../components/CustomButton";

const ListePostes = () => {

    const [selected, setSelected] = useState(false)

    const handlePress = () => {
        setSelected(!selected)

    }

    return (
        <SafeAreaView className="h-full flex-1 bg-white">
            <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col">
                <View className="space-y-4 w-full">
                    <TouchableOpacity onPress={handlePress}
                                      className={`${selected ? 'bg-[#494A50]' : 'bg-secondary-200'} flex-row w-full p-6 rounded-2xl justify-between items-center`}>
                        <Text className={`text-xl font-bold ${selected ? 'text-white' : ' '}`}>Inox</Text>
                        {selected ? (
                            <View className="flex-row space-x-2">
                                <TouchableOpacity>
                                    <FontAwesome name="camera" size={22} color="white"/>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Ionicons name="chatbubble" size={22} color="white"/>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="flex-row space-x-2">
                                <TouchableOpacity>
                                    <MaterialIcons name="edit" size={22}
                                                   color="#008170"/>
                                </TouchableOpacity>
                                <MaterialIcons name="cancel" size={22} color="#008170"/>
                            </View>
                        )}
                    </TouchableOpacity>
                    <View className="w-full">
                        <CustomButton title="Ajouter un poste de nettoyage"/>
                    </View>
                </View>
            </View>
            <View className="absolute bottom-0 w-full px-4 my-12 justify-center flex-row space-x-2">
                <TouchableOpacity
                    className="border-primary justify-center border-2 h-14 items-center w-1/2 rounded-2xl"
                >
                    <Text className="text-primary text-[16px] font-semibold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl">
                    <Text className="text-white text-[16px] font-semibold">Confirmer</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ListePostes;