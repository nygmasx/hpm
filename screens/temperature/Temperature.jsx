import React, {useState} from 'react';
import {FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import DateTimeField from "../../components/DateTimeField";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import {Checkbox} from "react-native-paper";
import {CheckBox} from "@rneui/base";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from "react-native-modal";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const Temperature = ({navigation}) => {

    const [check, setCheck] = useState(false)
    const [selected, setSelected] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const handleCheck = () => {
        setCheck(!check)
        setSelected(!selected)
    }

    const EQUIPEMENT = [
        {
            id: 1,
            name: 'Congélateur 1'
        },
        {
            id: 2,
            name: 'Congélateur 2'
        },
        {
            id: 3,
            name: 'Congélateur 3'
        }
    ]

    const renderItem = ({item}) => (
        <View className="flex-row justify-between border-b-[1px] border-b-secondary">
            <View className="flex-row items-center">
                <CheckBox checkedIcon={
                    <AntDesign name="checkcircle" size={20} color="#008170"/>
                } uncheckedIcon={
                    <FontAwesome name="circle" size={20} color="#8F9098"/>
                } checked={check} onPress={handleCheck}/>
                <Text className="font-bold text-[16px]">{item.name}</Text>
            </View>
            {!selected &&
                <View className="flex-row items-center space-x-1">
                    <TouchableOpacity onPress={toggleModal}>
                        <MaterialIcons name="edit" size={20}
                                       color="#008170"/>
                    </TouchableOpacity>
                    <MaterialIcons name="cancel" size={20} color="#008170"/>
                </View>
            }
        </View>
    )


    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View>
                <Modal isVisible={isModalVisible}>
                    <View className="p-6 space-y-8 bg-white items-center rounded-2xl justify-between">
                        <View className="w-full" style={{gap: 20}}>
                            <Text className="text-xl text-center font-extrabold">Ajouter un congélateur</Text>
                            <View className="space-y-4">
                                <FormField title="Nom de l'équipement"/>
                                <Text className="font-bold text-[16px]">Sélectionnez un type</Text>
                                <View className="space-y-4">
                                    <TouchableOpacity className="w-full justify-center bg-secondary-200 p-5 rounded-2xl">
                                        <Text className="text-xl font-extrabold">Congélateur</Text>
                                        <Text>min: -25°C, max: -18°C</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="w-full justify-center bg-secondary-200 p-5 rounded-2xl">
                                        <Text className="text-xl font-extrabold">Frigo</Text>
                                        <Text>min: 0°C, max: 4°C</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="w-full justify-center bg-secondary-200 p-5 rounded-2xl">
                                        <Text className="text-xl font-extrabold">Chaud</Text>
                                        <Text>min: 63°C</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row space-x-2 items-end">
                            <TouchableOpacity
                                className="border-primary justify-center border-2 h-14 items-center w-1/2 rounded-2xl"
                                onPress={toggleModal}
                            >
                                <Text className="text-primary text-[16px] font-semibold">Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl">
                                <Text className="text-white text-[16px] font-semibold">Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
            <View className="w-full flex-1 px-4 my-6 h-full flex-col space-y-8">
                <DateTimeField title="Date du relevé de température"/>
                <View className="space-y-4">
                    <View className="w-full flex-row justify-between items-center">
                        <Text className="font-semibold text-[16px]">Équipements</Text>
                        <TouchableOpacity
                            onPress={toggleModal}
                            className="px-2 py-1 space-x-2 bg-primary rounded-2xl items-center flex-row">
                            <Text className="text-white font-bold ml-2">Ajouter</Text>
                            <AntDesign name="plus" size="20" color="white"/>
                        </TouchableOpacity>
                    </View>
                    <View className="space-y-2">
                        <FlatList data={EQUIPEMENT} renderItem={renderItem} keyExtractor={item => item.id}/>
                    </View>
                </View>
            </View>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie"/>
            </View>
        </SafeAreaView>
    );
};

export default Temperature;