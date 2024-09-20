import React, {useContext, useEffect, useState} from 'react';
import {Alert, FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import DateTimeField from "../../components/DateTimeField";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import CheckBox from "expo-checkbox";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from "react-native-modal";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";
import CustomCounter from "../../components/CustomCounter";
import Toast from "react-native-toast-message";

const Nettoyage = ({navigation}) => {

    const [cleaningZones, setCleaningZones] = useState([])
    const [cleaningZoneName, setCleaningZoneName] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [checkedZones, setCheckedZones] = useState({});
    const [selectedZone, setSelectedZone] = useState([])
    const {user} = useContext(AuthContext)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    useEffect(() => {
        fetchUserCleaningZones()
    }, []);

    const handleCheckboxChange = (zoneId, zoneName) => {
        setCheckedZones(prevState => {
            const newCheckedZones = { ...prevState, [zoneId]: !prevState[zoneId] };

            // Determine if the checkbox was checked or unchecked
            const wasChecked = prevState[zoneId];
            const isChecked = !wasChecked;

            if (isChecked) {
                // Navigate to product detail if checked
                navigation.navigate('Liste Postes', { zoneId, zoneName });
            } else {
                // Uncheck case: Remove the product from selectedProducts
                setSelectedZone(prevZones => {
                    const updatedCleaningZones = prevZones.filter(cleaningZone => cleaningZone.zoneId !== zoneId);

                    // Alert and log data when product is removed
                    Alert.alert(
                        "Zone retiré",
                        `Le produit ${zoneName} a été retiré de la sélection.`,
                        [{ text: "OK" }]
                    );
                    console.log('Updated Selected Zone:', updatedCleaningZones);

                    return updatedCleaningZones;
                });
            }

            return newCheckedZones;
        });
    };

    const createCleaningZone = async () => {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('name', cleaningZoneName)

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/cleaning-zone/new', formData);
            await fetchUserCleaningZones()
            setIsModalVisible(!isModalVisible)
            Toast.show({
                type: 'success',
                text1: 'Zone de nettoyage enregistrée 🟢'
            })
        } catch (error) {
            console.error(error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur, veuillez réessayer 🔴'
            })
        } finally {
            setIsLoading(false);
        }
    }
    
    const fetchUserCleaningZones = () => {
        axiosConfig.get(`/user/${user.id}/cleaning-zones`, {})
            .then(response => {
                setCleaningZones(response.data)
            })
            .catch(error => {
                console.error(error)
            })
    }

    const renderItem = ({item}) => (
        <View className="flex-row justify-between border-b-[1px] border-b-secondary p-2">
            <View className="flex-row items-center space-x-4">
                <CheckBox
                    value={!!checkedZones[item.id]}
                    onValueChange={() => handleCheckboxChange(item.id, item.name)}
                    color="#008170"
                    className="rounded-full w-[25px] h-[25px]"
                />
                <Text className="font-bold text-[18px]">{item.name}</Text>
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
    )

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View>
                <Modal isVisible={isModalVisible}>
                    <View className="p-6 space-y-8 bg-white items-center rounded-2xl justify-between">
                        <View className="w-full" style={{gap: 20}}>
                            <Text className="text-xl text-center font-extrabold">Ajouter une zone de nettoyage</Text>
                            <View className="space-y-4">
                                <FormField title="Nom de la zone" value={cleaningZoneName} handleChangeText={setCleaningZoneName} />
                            </View>
                        </View>
                        <View className="flex-row space-x-2 items-end">
                            <TouchableOpacity
                                className="border-primary justify-center border-2 h-14 items-center w-1/2 rounded-2xl"
                                onPress={toggleModal}
                            >
                                <Text className="text-primary text-[16px] font-semibold">Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => createCleaningZone()}
                                className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl">
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
                        <Text className="font-semibold text-[16px]">Liste des zones à nettoyer</Text>
                        <TouchableOpacity
                            onPress={toggleModal}
                            className="px-2 py-1 space-x-2 bg-primary rounded-2xl items-center flex-row">
                            <Text className="text-white font-bold ml-2">Ajouter</Text>
                            <AntDesign name="plus" size="20" color="white"/>
                        </TouchableOpacity>
                    </View>
                    <View className="space-y-2">
                        <FlatList data={cleaningZones} renderItem={renderItem} keyExtractor={item => item.id}/>
                    </View>

                </View>
            </View>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie"/>
            </View>
        </SafeAreaView>
    );
};

export default Nettoyage;