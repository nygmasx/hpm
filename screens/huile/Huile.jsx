import React, {useState} from 'react';
import {FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import DateTimeField from "../../components/DateTimeField";
import {Chip, Searchbar} from "react-native-paper";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import {CheckBox} from "@rneui/base";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import FormField from "../../components/FormField";
import CounterInput from "react-native-counter-input";
import Counter from "react-native-counters";
import {SelectList} from "react-native-dropdown-select-list";

const Huile = ({navigation}) => {

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
            name: 'Friteuse 1'
        },
        {
            id: 2,
            name: 'Friteuse Industrielle'
        },
    ]

    const data = [
        {key: '1', value: 'Mobiles', disabled: true},
        {key: '2', value: 'Appliances'},
        {key: '3', value: 'Cameras'},
        {key: '4', value: 'Computers', disabled: true},
        {key: '5', value: 'Vegetables'},
        {key: '6', value: 'Diary Products'},
        {key: '7', value: 'Drinks'},
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
                                <View className="flex-row items-center">
                                    <View className="space-y-2">
                                        <Text className="font-bold text-lg">Nom de l'équipement</Text>
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
                                <View style={{gap: 10}}>
                                    <Text className="font-bold text-lg">Température</Text>
                                    <Counter buttonStyle={styles.buttons} buttonTextStyle={styles.color}/>
                                </View>
                                <View style={{gap: 10}}>
                                    <Text className="font-bold text-lg">Polarité</Text>
                                    <Counter buttonStyle={styles.buttons} buttonTextStyle={styles.color}/>
                                </View>
                                <View style={{gap: 10}}>
                                    <Text className="font-bold text-lg">Action corrective</Text>
                                    <View className="w-full flex-row items-center space-x-2">
                                        <SelectList
                                            setSelected={(value) => console.log(value)}
                                            data={data}
                                            boxStyles={styles.select}
                                            placeholder="Refroidissement"
                                        />
                                        <TouchableOpacity
                                            className="bg-primary rounded-full items-center justify-center w-[45px] h-[45px]">
                                            <FontAwesome name="camera" size={22} color="white"/>
                                        </TouchableOpacity>
                                    </View>
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
                <DateTimeField title="Date du relevé d'huile"/>
                <View className="space-y-4">
                    <View className="w-full flex-row justify-between items-center">
                        <Text className="font-semibold text-[16px]">Bac à huiles</Text>
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

const styles = StyleSheet.create({
    buttons: {
        borderRadius: '50%',
        backgroundColor: "#008170",
        borderColor: "#008170"
    },

    color: {
        color: "white"
    },

    select: {
        width: "90%",
        paddingVertical: 20,
        borderStyle: "solid",
        borderRadius: 12,
        borderColor: "#C5C6CC",
    }
})

export default Huile;