import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Image, StyleSheet, Dimensions } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomButton from "../../components/CustomButton";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import axiosConfig from "../../helpers/axiosConfig";
import FormField from "../../components/FormField";
import Modal from "react-native-modal";

const { width, height } = Dimensions.get('window');

const ListePostes = () => {
    const [cleaningStations, setCleaningStations] = useState([]);
    const [cleaningStationName, setCleaningStationName] = useState('');
    const [selectedStations, setSelectedStations] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editStationId, setEditStationId] = useState(null);
    const route = useRoute();
    const navigation = useNavigation();
    const {zoneName, zoneId} = route.params;
    const [stationData, setStationData] = useState({});

    useEffect(() => {
        fetchCleaningStation();
    }, []);

    const fetchCleaningStation = () => {
        console.log(`Fetching cleaning stations for zone ID: ${zoneId}`);
        axiosConfig.get(`/cleaning-zone/${zoneId}/cleaning-station`, {})
            .then(response => {
                console.log(`Received ${response.data.length} cleaning stations`);
                setCleaningStations(response.data);
                const initialStationData = {};
                response.data.forEach(station => {
                    initialStationData[station.id] = {comment: '', image: null};
                });
                setStationData(initialStationData);
                console.log('Station data initialized');
            })
            .catch(error => {
                console.error('Error fetching cleaning stations:', error);
            });
    };

    const createCleaningStation = async () => {
        console.log(`Attempting to create cleaning station: ${cleaningStationName}`);
        if (!cleaningStationName || !zoneId) {
            console.warn('Missing required fields for creating cleaning station');
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

        try {
            const response = await axiosConfig.post('/cleaning-station/new', data);
            console.log('Cleaning station created successfully:', response.data);
            await fetchCleaningStation();
            setIsModalVisible(false);
            Toast.show({
                type: 'success',
                text1: 'Poste de nettoyage enregistré 🟢',
            });
            setCleaningStationName('');
        } catch (error) {
            console.error('Error creating cleaning station:', error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur, veuillez réessayer 🔴',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateCleaningStation = async (stationId) => {
        console.log(`Attempting to update cleaning station ID: ${stationId}`);
        if (!stationId || !cleaningStationName || !zoneId) {
            console.warn('Missing required fields for updating cleaning station');
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

        try {
            const response = await axiosConfig.put(`/cleaning-station/${stationId}/edit`, data);
            console.log('Cleaning station updated successfully:', response.data);
            await fetchCleaningStation();
            setIsEditModalVisible(false);
            Toast.show({
                type: 'success',
                text1: 'Poste de nettoyage mis à jour 🟢',
            });
        } catch (error) {
            console.error('Error updating cleaning station:', error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur, veuillez réessayer 🔴',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCleaningZone = async (stationId) => {
        console.log(`Attempting to delete cleaning station ID: ${stationId}`);
        try {
            const response = await axiosConfig.delete(`/cleaning-station/${stationId}/delete`, {});
            console.log('Cleaning station deleted successfully:', response.data);
            await fetchCleaningStation();
            Toast.show({
                type: 'success',
                text1: 'Poste de nettoyage supprimé 🟢',
            });
        } catch (error) {
            console.error('Error deleting cleaning station:', error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur, veuillez réessayer 🔴',
            });
        }
    };

    const handlePress = (stationId) => {
        console.log(`Toggling selection for station ID: ${stationId}`);
        setSelectedStations(prevState => {
            const newState = {
                ...prevState,
                [stationId]: !prevState[stationId]
            };
            console.log('Updated selected stations:', newState);
            return newState;
        });
    };

    const uploadImage = async (stationId) => {
        console.log(`Attempting to upload image for station ID: ${stationId}`);
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                console.log(`Image captured: ${imageUri}`);
                setStationData(prevData => {
                    const newData = {
                        ...prevData,
                        [stationId]: {
                            ...prevData[stationId],
                            image: imageUri
                        }
                    };
                    console.log('Updated station data with new image:', newData);
                    return newData;
                });
            } else {
                console.log('Image capture cancelled');
            }
        } catch (e) {
            console.error('Error uploading image:', e);
        }
    };

    const handleCommentChange = (stationId, text) => {
        console.log(`Updating comment for station ID: ${stationId}`);
        setStationData(prevData => {
            const newData = {
                ...prevData,
                [stationId]: {
                    ...prevData[stationId],
                    comment: text
                }
            };
            console.log('Updated station data with new comment:', newData);
            return newData;
        });
    };

    const handleSubmit = () => {
        console.log('Preparing data for submission');
        const selectedStationsData = Object.entries(selectedStations)
            .filter(([_, isSelected]) => isSelected)
            .map(([stationId, _]) => ({
                id: stationId,
                ...stationData[stationId]
            }));

        if (selectedStationsData.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Veuillez sélectionner au moins une station.',
            });
            return;
        }

        console.log('Data being sent:', { stations: selectedStationsData });
        navigation.navigate('Nettoyage', {
            zoneId,
            zoneName,
            stations: selectedStationsData
        });
        console.log('Navigated to Nettoyage screen');
    };


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Modal isVisible={isModalVisible}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ajouter un poste de nettoyage</Text>
                        <View style={styles.modalForm}>
                            <FormField
                                title="Nom du poste"
                                value={cleaningStationName}
                                handleChangeText={setCleaningStationName}
                            />
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmButton}
                                onPress={createCleaningStation}
                            >
                                <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal isVisible={isEditModalVisible}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Modifier un poste de nettoyage</Text>
                        <View style={styles.modalForm}>
                            <FormField
                                title="Nom du poste"
                                value={cleaningStationName}
                                handleChangeText={setCleaningStationName}
                            />
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setIsEditModalVisible(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmButton}
                                onPress={() => updateCleaningStation(editStationId)}
                            >
                                <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal isVisible={isCommentModalVisible}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ajouter un commentaire</Text>
                        <View style={styles.modalForm}>
                            <FormField
                                title="Commentaire"
                                value={comment}
                                handleChangeText={setComment}
                                multiline={2}
                            />
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setIsCommentModalVisible(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmButton}
                                onPress={() => {
                                    // Here you would add logic to save the comment
                                    setIsCommentModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={styles.content}>
                    {cleaningStations.map((station, index) => (
                        <View key={index} style={styles.stationContainer}>
                            <TouchableOpacity
                                onPress={() => handlePress(station.id)}
                                style={[
                                    styles.stationButton,
                                    selectedStations[station.id] && styles.selectedStationButton
                                ]}
                            >
                                <Text style={[
                                    styles.stationName,
                                    selectedStations[station.id] && styles.selectedStationName
                                ]}>{station.name}</Text>
                                {selectedStations[station.id] ? (
                                    <View style={styles.actionIcons}>
                                        <TouchableOpacity onPress={() => uploadImage(station.id)}>
                                            <FontAwesome name="camera" size={22} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setIsCommentModalVisible(true)}>
                                            <Ionicons name="chatbubble" size={22} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.actionIcons}>
                                        <TouchableOpacity onPress={() => {
                                            setCleaningStationName(station.name);
                                            setEditStationId(station.id);
                                            setIsEditModalVisible(true);
                                        }}>
                                            <MaterialIcons name="edit" size={22} color="#008170" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => deleteCleaningZone(station.id)}>
                                            <MaterialIcons name="cancel" size={22} color="#008170" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {selectedStations[station.id] && (
                                <View style={styles.commentSection}>
                                    <FormField
                                        title="Commentaire"
                                        value={stationData[station.id]?.comment || ''}
                                        handleChangeText={(text) => handleCommentChange(station.id, text)}
                                        multiline={2}
                                    />
                                    {stationData[station.id]?.image && (
                                        <Image
                                            source={{uri: stationData[station.id].image}}
                                            style={styles.stationImage}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                    <View style={styles.addButtonContainer}>
                        <CustomButton
                            title="+ Ajouter un poste de nettoyage"
                            handlePress={() => setIsModalVisible(true)}
                            icon="plus"
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.topButtonsContainer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.confirmButtonText}>Confirmer</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.03,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: width * 0.06,
        borderRadius: 20,
    },
    modalTitle: {
        fontSize: width * 0.05,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: height * 0.02,
    },
    modalForm: {
        marginBottom: height * 0.03,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalCancelButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.06,
        width: '48%',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#008170',
    },
    modalCancelButtonText: {
        color: '#008170',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    modalConfirmButton: {
        backgroundColor: '#008170',
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.06,
        width: '48%',
        borderRadius: 16,
    },
    modalConfirmButtonText: {
        color: 'white',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    stationContainer: {
        marginBottom: height * 0.02,
    },
    stationButton: {
        flexDirection: 'row',
        width: '100%',
        padding: width * 0.04,
        borderRadius: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    selectedStationButton: {
        backgroundColor: '#494A50',
    },
    stationName: {
        fontSize: width * 0.045,
        fontWeight: '700',
    },
    selectedStationName: {
        color: 'white',
    },
    actionIcons: {
        flexDirection: 'row',
        gap: width * 0.02,
    },
    commentSection: {
        marginTop: height * 0.01,
        padding: width * 0.04,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    stationImage: {
        width: width * 0.25,
        height: width * 0.25,
        marginTop: height * 0.01,
    },
    addButtonContainer: {
        marginVertical: height * 0.03,
    },
    cancelButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.05,
        width: '48%',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#008170',
    },
    cancelButtonText: {
        color: '#008170',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#008170',
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.05,
        width: '48%',
        borderRadius: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
});

export default ListePostes;