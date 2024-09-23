import React, { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import DateTimeField from "../../components/DateTimeField";
import { AntDesign } from "@expo/vector-icons";
import CheckBox from "expo-checkbox";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from "react-native-modal";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";
import Toast from "react-native-toast-message";
import { useRoute, useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

const Nettoyage = () => {
    const [cleaningZones, setCleaningZones] = useState([]);
    const [cleaningZoneName, setCleaningZoneName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [checkedZones, setCheckedZones] = useState({});
    const [selectedStations, setSelectedStations] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { user } = useContext(AuthContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();

    const toggleModal = () => setIsModalVisible(!isModalVisible);

    useEffect(() => {
        fetchUserCleaningZones();
    }, []);

    useEffect(() => {
        if (route.params?.zoneId && route.params?.stations) {
            setSelectedStations(prev => ({
                ...prev,
                [route.params.zoneId]: route.params.stations
            }));
            setCheckedZones(prev => ({
                ...prev,
                [route.params.zoneId]: true
            }));
        }
    }, [route.params]);

    const fetchUserCleaningZones = () => {
        axiosConfig.get(`/user/${user.id}/cleaning-zones`, {})
            .then(response => {
                setCleaningZones(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const handleCheckboxChange = (zoneId, zoneName) => {
        setCheckedZones(prevState => {
            const newCheckedZones = { ...prevState, [zoneId]: !prevState[zoneId] };

            if (newCheckedZones[zoneId]) {
                navigation.navigate('Liste Postes', { zoneId, zoneName });
            } else {
                setSelectedStations(prev => {
                    const newSelectedStations = { ...prev };
                    delete newSelectedStations[zoneId];
                    return newSelectedStations;
                });
                Alert.alert(
                    "Zone retirée",
                    `La zone ${zoneName} a été retirée de la sélection.`,
                    [{ text: "OK" }]
                );
            }

            return newCheckedZones;
        });
    };

    const createCleaningZone = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', cleaningZoneName);

        try {
            await axiosConfig.post('/cleaning-zone/new', formData);
            await fetchUserCleaningZones();
            setIsModalVisible(false);
            Toast.show({
                type: 'success',
                text1: 'Zone de nettoyage enregistrée 🟢'
            });
        } catch (error) {
            console.error(error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur, veuillez réessayer 🔴'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        console.log('Selected Stations:', selectedStations);
        console.log('Starting submission process');

        if (!selectedDate) {
            console.warn('No date selected');
            Toast.show({
                type: 'error',
                text1: 'Veuillez sélectionner une date pour le plan de nettoyage.',
            });
            return;
        }

        const selectedZoneIds = Object.keys(checkedZones).filter(id => checkedZones[id]);
        if (selectedZoneIds.length === 0) {
            console.warn('No zones selected');
            Toast.show({
                type: 'error',
                text1: 'Veuillez sélectionner au moins une zone de nettoyage.',
            });
            return;
        }

        const cleaningZonesData = selectedZoneIds.map(zoneId => {
            const zoneStations = selectedStations[zoneId];
            if (!zoneStations || zoneStations.length === 0) {
                throw new Error(`Aucune station sélectionnée pour la zone ${zoneId}`);
            }
            return {
                cleaning_zone_id: zoneId,
                cleaning_stations: zoneStations.map(station => ({
                    station_id: station.id,
                    comment: station.comment || null,
                    image_url: station.image || null,
                })),
            };
        });

        const data = {
            date: selectedDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            cleaning_zones: cleaningZonesData,
        };

        console.log('Prepared data for submission:', JSON.stringify(data, null, 2));

        try {
            setIsLoading(true);
            const response = await axiosConfig.post('/cleaning-plan/new', data);
            console.log('Cleaning plan created successfully:', response.data);
            Toast.show({
                type: 'success',
                text1: 'Plan de nettoyage créé avec succès.',
            });
            navigation.navigate('Accueil'); // Adjust as needed
        } catch (error) {
            console.error('Error creating cleaning plan:', error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur lors de la création du plan de nettoyage. Veuillez réessayer.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
                <CheckBox
                    value={!!checkedZones[item.id]}
                    onValueChange={() => handleCheckboxChange(item.id, item.name)}
                    color="#008170"
                    style={styles.checkbox}
                />
                <Text style={styles.listItemText}>{item.name}</Text>
            </View>
            {!checkedZones[item.id] &&
                <View style={styles.listItemRight}>
                    <TouchableOpacity onPress={toggleModal}>
                        <MaterialIcons name="edit" size={20} color="#008170"/>
                    </TouchableOpacity>
                    <MaterialIcons name="cancel" size={20} color="#008170"/>
                </View>
            }
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Modal isVisible={isModalVisible}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Ajouter une zone de nettoyage</Text>
                        <FormField
                            title="Nom de la zone"
                            value={cleaningZoneName}
                            handleChangeText={setCleaningZoneName}
                        />
                    </View>
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={toggleModal}
                        >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={createCleaningZone}
                        >
                            <Text style={styles.confirmButtonText}>Confirmer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <View style={styles.content}>
                <DateTimeField
                    title="Date du relevé de température"
                    value={selectedDate}
                    onChange={setSelectedDate}
                />
                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Liste des zones à nettoyer</Text>
                        <TouchableOpacity
                            onPress={toggleModal}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>Ajouter</Text>
                            <AntDesign name="plus" size={20} color="white"/>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={cleaningZones}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        style={styles.list}
                    />
                </View>
            </View>
            <View style={styles.submitButtonContainer}>
                <CustomButton
                    title="Valider la saisie"
                    handlePress={handleSubmit}
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.03,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: width * 0.06,
        borderRadius: 20,
    },
    modalHeader: {
        width: '100%',
        marginBottom: height * 0.04,
    },
    modalTitle: {
        fontSize: width * 0.05,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: height * 0.02,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        borderColor: '#008170',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.06,
        width: '48%',
        borderRadius: 16,
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
        height: height * 0.06,
        width: '48%',
        borderRadius: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    listContainer: {
        marginTop: height * 0.04,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height * 0.02,
    },
    listTitle: {
        fontWeight: '600',
        fontSize: width * 0.04,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#008170',
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.02,
        borderRadius: 16,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '700',
        marginRight: width * 0.02,
    },
    list: {
        maxHeight: height * 0.5,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: height * 0.015,
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        borderRadius: 12.5,
        width: width * 0.06,
        height: width * 0.06,
        marginRight: width * 0.03,
    },
    listItemText: {
        fontWeight: '700',
        fontSize: width * 0.045,
    },
    listItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitButtonContainer: {
        position: 'absolute',
        bottom: height * 0.05,
        width: '100%',
        paddingHorizontal: width * 0.04,
    },
});

export default Nettoyage;