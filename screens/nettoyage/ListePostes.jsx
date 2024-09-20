import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {FontAwesome, Ionicons} from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomButton from "../../components/CustomButton";
import {useRoute} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";
import FormField from "../../components/FormField";
import Modal from "react-native-modal";

const ListePostes = ({navigation}) => {

        const [selected, setSelected] = useState(false);
        const [cleaningStations, setCleaningStations] = useState([]);
        const [cleaningStationName, setCleaningStationName] = useState('');
        const [selectedStations, setSelectedStations] = useState({});
        const [isModalVisible, setIsModalVisible] = useState(false);
        const [isEditModalVisible, setIsEditModalVisible] = useState(false);
        const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
        const [comment, setComment] = useState('')
        const [isLoading, setIsLoading] = useState(false);
        const [editStationId, setEditStationId] = useState(null); // Added state to track stationId for editing
        const route = useRoute();
        const {zoneName, zoneId} = route.params;
        const [images, setImages] = useState([]);

        const toggleModal = () => {
            setIsModalVisible(!isModalVisible);
            console.log(isModalVisible)
        };

        const toggleEditModal = () => {
            setIsEditModalVisible(!isEditModalVisible);
        };

        const toggleCommentModal = () => {
            setIsCommentModalVisible(!isCommentModalVisible);
        };

        useEffect(() => {
            fetchCleaningStation();
        }, []);

        const fetchCleaningStation = () => {
            axiosConfig.get(`/cleaning-zone/${zoneId}/cleaning-station`, {})
                .then(response => {
                    setCleaningStations(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        };

        const updateCleaningStation = async (stationId) => {
            if (!stationId || !cleaningStationName || !zoneId) {
                Toast.show({
                    type: 'error',
                    text1: 'Veuillez vérifier les champs obligatoires 🔴',
                });
                return;
            }

            setIsLoading(true);

            const data = {
                name: cleaningStationName,
                cleaning_zone_id: zoneId
            };

            console.log("Data being sent:", data);

            try {
                await axiosConfig.put(`/cleaning-station/${stationId}/edit`, data, {
                    headers: {
                        'Content-Type': 'application/json', // Explicitly set JSON headers
                    },
                });
                await fetchCleaningStation();
                setIsEditModalVisible(false);
                Toast.show({
                    type: 'success',
                    text1: 'Poste de nettoyage mis à jour 🟢',
                });
            } catch (error) {
                console.error("Error response:", error.response?.data || error.message);
                Toast.show({
                    type: 'error',
                    text1: 'Erreur, veuillez réessayer 🔴',
                });
            } finally {
                setIsLoading(false);
            }
        };

        const createCleaningStation = async () => {
            if (!zoneId) {
                Toast.show({
                    type: 'error',
                    text1: 'Zone ID is missing or invalid 🔴',
                });
                return;
            }

            setIsLoading(true);
            const formData = new FormData();
            formData.append('name', cleaningStationName);
            formData.append('cleaning_zone_id', zoneId);

            try {
                await axiosConfig.post('/cleaning-station/new', formData);
                await fetchCleaningStation();
                setIsModalVisible(false);
                Toast.show({
                    type: 'success',
                    text1: 'Poste de nettoyage enregistré 🟢',
                });
                setCleaningStationName('')
            } catch (error) {
                console.error(error.response?.data || error.message);
                Toast.show({
                    type: 'error',
                    text1: 'Erreur, veuillez réessayer 🔴',
                });
            } finally {
                setIsLoading(false);
            }
        };

        const deleteCleaningZone = async (stationId) => {
            await axiosConfig.delete(`/cleaning-station/${stationId}/delete`, {})
                .then(response => {
                    fetchCleaningStation();
                    Toast.show({
                        type: 'success',
                        text1: 'Poste de nettoyage supprimé 🟢',
                    });
                })
                .catch(error => {
                    console.error(error.response?.data || error.message);
                    Toast.show({
                        type: 'error',
                        text1: 'Erreur, veuillez réessayer 🔴',
                    });
                })
        }

        const handlePress = (stationId, stationName) => {
            setSelectedStations(prevState => {
                const newSelectedStations = {...prevState, [stationId]: !prevState[stationId]};

                if (!prevState[stationId]) {
                    console.log(`Poste ${stationName} sélectionné`);
                } else {
                    Toast.show({
                        type: 'success',
                        text1: `Le poste ${stationName} a été désélectionné`,
                    });
                    console.log(`Poste ${stationName} désélectionné`);
                }
                console.log(newSelectedStations);
                return newSelectedStations;
            });
        };

        const uploadImages = async () => {
            try {
                const result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                });

                if (!result.canceled) {
                    const imageUri = result.assets[0].uri;
                    const name = imageUri.split('/').pop();
                    const type = result.assets[0].type || 'image/jpeg';
                    const info = await FileSystem.getInfoAsync(imageUri);
                    const sizeInMB = (info.size / (1024 * 1024)).toFixed(2) + ' MB';

                    setImages([...images, {uri: imageUri, name, size: sizeInMB, type}]);
                }
            } catch (e) {
                console.error(e);
            }
        };

        useEffect(() => {
            navigation.setOptions({title: zoneName});
            console.log(zoneId);
        }, [navigation, zoneName]);

        const handleSubmit = async () => {
        };

        return (
            <SafeAreaView className="h-full flex-1 bg-white">
                <ScrollView>
                    <Modal isVisible={isModalVisible}>
                        <View className="p-6 space-y-8 bg-white items-center rounded-2xl justify-between">
                            <View className="w-full" style={{gap: 20}}>
                                <Text className="text-xl text-center font-extrabold">Ajouter un poste de nettoyage</Text>
                                <View className="space-y-4">
                                    <FormField title="Nom du poste" value={cleaningStationName}
                                               handleChangeText={setCleaningStationName}/>
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
                                    onPress={() => createCleaningStation()}
                                    className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl">
                                    <Text className="text-white text-[16px] font-semibold">Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <Modal isVisible={isEditModalVisible}>
                        <View className="p-6 space-y-8 bg-white items-center rounded-2xl justify-between">
                            <View className="w-full" style={{gap: 20}}>
                                <Text className="text-xl text-center font-extrabold">Modifier un poste de nettoyage</Text>
                                <View className="space-y-4">
                                    <FormField title="Nom du poste" value={cleaningStationName}
                                               handleChangeText={setCleaningStationName}/>
                                </View>
                            </View>
                            <View className="flex-row space-x-2 items-end">
                                <TouchableOpacity
                                    className="border-primary justify-center border-2 h-14 items-center w-1/2 rounded-2xl"
                                    onPress={toggleEditModal}
                                >
                                    <Text className="text-primary text-[16px] font-semibold">Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => updateCleaningStation(editStationId)} // Pass stationId here
                                    className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl">
                                    <Text className="text-white text-[16px] font-semibold">Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <Modal isVisible={isCommentModalVisible}>
                        <View className="p-6 space-y-8 bg-white items-center rounded-2xl justify-between">
                            <View className="w-full" style={{gap: 20}}>
                                <Text className="text-xl text-center font-extrabold">Ajouter un commentaire</Text>
                                <View className="space-y-4">
                                    <FormField
                                        title="Commentaire"
                                        value={comment}
                                        handleChangeText={setComment}
                                        multiline={2}
                                    />
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
                                    onPress={() => createCleaningStation()}
                                    className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl">
                                    <Text className="text-white text-[16px] font-semibold">Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>


                    <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col">
                        <View className="space-y-4 w-full">
                            {cleaningStations.map((station, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handlePress(station.id, station.name)}
                                    className={`${selectedStations[station.id] ? 'bg-[#494A50]' : 'bg-secondary-200'} flex-row w-full p-6 rounded-2xl justify-between items-center`}>
                                    <Text
                                        className={`text-xl font-bold ${selectedStations[station.id] ? 'text-white' : ' '}`}>{station.name}</Text>
                                    {selectedStations[station.id] ? (
                                        <View className="flex-row space-x-2">
                                            <TouchableOpacity onPress={() => uploadImages()}>
                                                <FontAwesome name="camera" size={22} color="white"/>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => toggleCommentModal()}>
                                                <Ionicons name="chatbubble" size={22} color="white"/>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View className="flex-row space-x-2">
                                            <TouchableOpacity onPress={() => {
                                                setCleaningStationName(station.name);
                                                setEditStationId(station.id); // Set stationId for editing
                                                toggleEditModal();
                                            }}>
                                                <MaterialIcons name="edit" size={22} color="#008170"/>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => deleteCleaningZone(station.id)}
                                            >
                                                <MaterialIcons name="cancel" size={22} color="#008170"/>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                            <View className="my-6">
                                <CustomButton title="+ Ajouter un poste de nettoyage" handlePress={toggleModal}
                                              icon="plus"/>
                            </View>
                        </View>
                    </View>
                    <View className="  bottom-0 w-full px-4 my- justify-center flex-row space-x-2">
                        <TouchableOpacity
                            className="border-primary justify-center border-2 h-14 items-center w-1/2 rounded-2xl"
                        >
                            <Text className="text-primary text-[16px] font-semibold">Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl">
                            <Text className="text-white text-[16px] font-semibold">Confirmer</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
;

export default ListePostes;
