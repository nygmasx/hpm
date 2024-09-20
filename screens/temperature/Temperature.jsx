import React, {useContext, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View} from "react-native";
import DateTimeField from "../../components/DateTimeField";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import CheckBox from "expo-checkbox";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from "react-native-modal";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";
import Toast from "react-native-toast-message";
import CustomCounter from "../../components/CustomCounter";

const Temperature = ({navigation}) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [selectedEquipments, setSelectedEquipments] = useState([]);
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [equipmentDegree, setEquipmentDegree] = useState()
    const [equipmentName, setEquipmentName] = useState("");
    const [selectedType, setSelectedType] = useState(null);
    const {user} = useContext(AuthContext);

    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: 'Equipement créé 🟢',
        });
    };

    const fetchUserEquipments = () => {
        axiosConfig.get(`/user/${user.id}/equipments`, {})
            .then(response => {
                setEquipments(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    };

    useEffect(() => {
        fetchUserEquipments();

    }, []);

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const handleCheck = (id) => {
        setEquipments(prevEquipments => {
            return prevEquipments.map(item => {
                if (item.id === id) {
                    const checked = !item.checked;
                    const degree = item.type === "Frigo" ? equipmentDegree :
                        (item.type === "Congélateur" ? equipmentDegree : equipmentDegree);

                    if (checked) {
                        setSelectedEquipments(prev => [...prev, { equipment_id: id, degree }]);
                        console.log('Added equipment:', { equipment_id: id, degree });
                    } else {
                        setSelectedEquipments(prev => prev.filter(equipment => equipment.equipment_id !== id));
                        console.log('Removed equipment:', { equipment_id: id });
                    }

                    return { ...item, checked };
                }
                return item;
            });
        });
    };


    const handleDegreeChange = (id, newDegree) => {
        setEquipments(prevEquipments =>
            prevEquipments.map(item =>
                item.id === id ? {...item, degree: newDegree} : item
            )
        );

        setSelectedEquipments(prev =>
            prev.map(equipment =>
                equipment.equipment_id === id ? {...equipment, degree: newDegree} : equipment
            )
        );

        // Log the degree change in real-time
        console.log(`Equipment ID: ${id}, New Degree: ${newDegree}`);
    };


    const handlingEquipmentType = (equipmentType) => {
        setSelectedType(equipmentType);
    };

    const equipmentCreate = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', equipmentName);
        formData.append('type', selectedType);

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/equipment/new', formData);
            await fetchUserEquipments();
            setIsModalVisible(!isModalVisible);
            showToast();
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const sendData = async () => {
        if (selectedEquipments.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Aucun équipement sélectionné',
            });
            return;
        }

        setIsLoading(true);

        // Prepare the data for submission
        const data = {
            reading_date: date.toISOString().slice(0, 19).replace('T', ' '), // Convert date to ISO string
            equipments: selectedEquipments.map(equipment => ({
                equipment_id: equipment.equipment_id,
                degrees: equipment.degree.toString(), // Ensure degree is a string
            })),
        };

        // Log the data to be sent
        console.log('Data to be sent:', data);

        try {
            // Set authorization header
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

            // Send the data to the API
            const response = await axiosConfig.post('/temperature/new', data);

            // Log the response from the API
            console.log('API response:', response.data);

            // Show success message
            Toast.show({
                type: 'success',
                text1: 'Données envoyées avec succès',
            });

            // Optionally, navigate to another screen or reset state here
            navigation.navigate('Accueil'); // Replace with actual screen

        } catch (error) {
            console.error('Error sending data:', error.response?.data || error.message);

            // Show error message
            Toast.show({
                type: 'error',
                text1: 'Erreur lors de l\'envoi des données',
            });
        } finally {
            setIsLoading(false);
        }
    };



    const renderItem = ({item}) => (
        <View className="flex-row justify-between border-b-[1px] border-b-secondary p-2">
            <View className="flex-row items-center space-x-4">
                <CheckBox
                    value={item.checked}
                    onValueChange={() => handleCheck(item.id)}
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
            {item.checked && (
                <>
                    <CustomCounter
                        value={item.degree}
                        handleChange={(newDegree) => handleDegreeChange(item.id, newDegree)}
                        initial={item.type === "Frigo" ? 0 : (item.type === "Congélateur" ? -25 : 0)}
                        min={item.type === "Frigo" ? 0 : (item.type === "Congélateur" ? -25 : 0)}
                        max={item.type === "Frigo" ? 4 : (item.type === "Congélateur" ? -18 : 0)}
                    />
                </>
            )}
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
                                <FormField title="Nom de l'équipement" value={equipmentName}
                                           handleChangeText={setEquipmentName}/>
                                <Text className="font-bold text-[16px]">Sélectionnez un type</Text>
                                <View className="space-y-4">
                                    <TouchableOpacity
                                        onPress={() => handlingEquipmentType("Congélateur")}
                                        className={`w-full flex-row justify-between items-center ${selectedType === 'Congélateur' ? 'bg-primary text-white' : 'bg-secondary-200'} p-5 rounded-2xl`}>
                                        <View>
                                            <Text
                                                className={`text-xl font-extrabold ${selectedType === 'Congélateur' ? 'text-white' : ''}`}>Congélateur</Text>
                                            <Text>min: -25°C, max: -18°C</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handlingEquipmentType("Frigo")}
                                        className={`w-full flex-row justify-between items-center ${selectedType === 'Frigo' ? 'bg-primary text-white' : 'bg-secondary-200'} p-5 rounded-2xl`}>
                                        <Text
                                            className={`text-xl font-extrabold ${selectedType === 'Frigo' ? 'text-white' : ''}`}>Frigo</Text>
                                        <Text>min: 0°C, max: 4°C</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handlingEquipmentType("Chaud")}
                                        className={`w-full flex-row justify-between items-center ${selectedType === 'Chaud' ? 'bg-primary text-white' : 'bg-secondary-200'} p-5 rounded-2xl`}>
                                        <Text
                                            className={`text-xl font-extrabold ${selectedType === 'Chaud' ? 'text-white' : ''}`}>Chaud</Text>
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
                            <TouchableOpacity className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl"
                                              onPress={equipmentCreate}
                            >
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
                <CustomButton title="Valider la saisie" handlePress={sendData}/>
            </View>
        </SafeAreaView>
    );
};

export default Temperature;