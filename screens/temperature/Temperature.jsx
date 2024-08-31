import React, {useContext, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import DateTimeField from "../../components/DateTimeField";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import {CheckBox} from "@rneui/base";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from "react-native-modal";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";

const Temperature = ({navigation}) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [equipments, setEquipments] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [equipmentName, setEquipmentName] = useState(equipmentName)
    const [equipmentType, setEquipmentType] = useState(equipmentName)
    const {user} = useContext(AuthContext);

    const fetchUserEquipments = () => {
        axiosConfig.get(`/user/${user.id}/equipments`, {})
            .then(response => {
                setEquipments(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    useEffect(() => {
        fetchUserEquipments();
    }, []);


    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const handleCheck = (id) => {
        setEquipments(prevEquipments =>
            prevEquipments.map(item =>
                item.id === id ? {...item, checked: !item.checked} : item
            )
        );
    };

    const equipmentCreate = async () => {
        setIsLoading(true)
        const formData = new FormData();
        formData.append('name', equipmentName)
        formData.append('type', equipmentType)

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/equipment/new', formData);
            await fetchUserEquipments()
            setIsModalVisible(!isModalVisible)
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const renderItem = ({item}) => (
        <View className="flex-row justify-between border-b-[1px] border-b-secondary">
            <View className="flex-row items-center">
                <CheckBox
                    checkedIcon={<AntDesign name="checkcircle" size={20} color="#008170"/>}
                    uncheckedIcon={<FontAwesome name="circle" size={20} color="#8F9098"/>}
                    checked={item.checked}
                    onPress={() => handleCheck(item.id)}
                />
                <Text className="font-bold text-[16px]">{item.name}</Text>
            </View>
            {!item.checked &&
                <View className="flex-row items-center space-x-1">
                    <TouchableOpacity onPress={toggleModal}>
                        <MaterialIcons name="edit" size={20} color="#008170"/>
                    </TouchableOpacity>
                    <MaterialIcons name="cancel" size={20} color="#008170"/>
                </View>
            }
        </View>
    );

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View>
                <Modal isVisible={isModalVisible}>
                    <View className="p-6 space-y-8 bg-white items-center rounded-2xl justify-between">
                        <View className="w-full" style={{gap: 20}}>
                            <Text className="text-xl text-center font-extrabold">Ajouter un équipement</Text>
                            <View className="space-y-4">
                                <FormField title="Nom de l'équipement"/>
                                <Text className="font-bold text-[16px]">Sélectionnez un type</Text>
                                <View className="space-y-4">
                                    <TouchableOpacity
                                        className="w-full flex-row justify-between items-center bg-secondary-200 p-5 rounded-2xl">
                                        <View>
                                            <Text className="text-xl font-extrabold">Congélateur</Text>
                                            <Text>min: -25°C, max: -18°C</Text>
                                        </View>
                                        <CheckBox
                                            checkedIcon={<AntDesign name="checkcircle" size={20} color="#008170"/>}
                                            uncheckedIcon={<FontAwesome name="circle" size={20} color="#8F9098"/>}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="w-full justify-center bg-secondary-200 p-5 rounded-2xl">
                                        <Text className="text-xl font-extrabold">Frigo</Text>
                                        <Text>min: 0°C, max: 4°C</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="w-full justify-center bg-secondary-200 p-5 rounded-2xl">
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
                        <FlatList data={equipments} renderItem={renderItem} keyExtractor={item => item.id.toString()}/>
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
