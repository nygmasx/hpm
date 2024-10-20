import React, {useContext, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View, Dimensions, StyleSheet} from "react-native";
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

const { width, height } = Dimensions.get('window');

const Temperature = ({navigation}) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [selectedEquipments, setSelectedEquipments] = useState([]);
    const [date, setDate] = useState('');
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
            setEquipmentName('')
            setSelectedType(null)
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
            reading_date: date,
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

    const handleDateTimeChange = (dateTime) => {
        console.log('DateTime changed:', dateTime);
        setDate(dateTime);
    };

    const renderItem = ({ item }) => (
        <View style={styles.equipmentItem}>
            <View style={styles.equipmentInfo}>
                <CheckBox
                    value={item.checked}
                    onValueChange={() => handleCheck(item.id)}
                    color="#008170"
                    style={styles.checkbox}
                />
                <Text style={styles.equipmentName}>{item.name}</Text>
            </View>
            {item.checked && (
                <CustomCounter
                    value={item.degree}
                    handleChange={(newDegree) => handleDegreeChange(item.id, newDegree)}
                    initial={
                        item.type === "Frigo" ? 0 :
                            (item.type === "Congélateur" ? -25 :
                                (item.type === "Chaud" ? 63 : 0))
                    }
                    min={
                        item.type === "Frigo" ? 0 :
                            (item.type === "Congélateur" ? -25 :
                                (item.type === "Chaud" ? 63 : 0))
                    }
                    max={
                        item.type === "Frigo" ? 4 :
                            (item.type === "Congélateur" ? -18 :
                                (item.type === "Chaud" ? 100 : 0))
                    }
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Modal isVisible={isModalVisible}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Ajouter un équipement</Text>
                    <View style={styles.modalForm}>
                        <FormField title="Nom de l'équipement" value={equipmentName} handleChangeText={setEquipmentName} />
                        <Text style={styles.typeSelectionTitle}>Sélectionnez un type</Text>
                        {['Congélateur', 'Frigo', 'Chaud'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => handlingEquipmentType(type)}
                                style={[
                                    styles.typeButton,
                                    selectedType === type && styles.selectedTypeButton
                                ]}
                            >
                                <Text style={[
                                    styles.typeButtonText,
                                    selectedType === type && styles.selectedTypeButtonText
                                ]}>{type}</Text>
                                <Text style={styles.typeButtonSubtext}>
                                    {type === 'Congélateur' ? 'min: -25°C, max: -18°C' :
                                        type === 'Frigo' ? 'min: 0°C, max: 4°C' : 'min: 63°C'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={equipmentCreate}>
                            <Text style={styles.confirmButtonText}>Confirmer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <View style={styles.content}>
                <DateTimeField onChange={handleDateTimeChange} title="Date du relevé de température" />
                <View style={styles.equipmentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Équipements</Text>
                        <TouchableOpacity onPress={toggleModal} style={styles.addButton}>
                            <Text style={styles.addButtonText}>Ajouter</Text>
                            <AntDesign name="plus" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={equipments}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        style={styles.equipmentList}
                    />
                </View>
            </View>
            <View style={styles.submitButtonContainer}>
                <CustomButton title="Valider la saisie" handlePress={sendData} />
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
    modalTitle: {
        fontSize: width * 0.05,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: height * 0.02,
    },
    modalForm: {
        marginVertical: height * 0.02,
        gap: 10
    },
    typeSelectionTitle: {
        fontWeight: '700',
        fontSize: width * 0.04,
        marginBottom: height * 0.01,
    },
    typeButton: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: width * 0.04,
        borderRadius: 16,
        marginBottom: height * 0.01,
    },
    selectedTypeButton: {
        backgroundColor: '#008170',
    },
    typeButtonText: {
        fontSize: width * 0.045,
        fontWeight: '800',
    },
    selectedTypeButtonText: {
        color: 'white',
    },
    typeButtonSubtext: {
        fontSize: width * 0.035,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: height * 0.02,
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
    equipmentSection: {
        marginTop: height * 0.03,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height * 0.02,
    },
    sectionTitle: {
        fontWeight: '600',
        fontSize: width * 0.04,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#008170',
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.03,
        borderRadius: 16,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '700',
        marginRight: width * 0.02,
    },
    equipmentList: {
        maxHeight: height * 0.5,
    },
    equipmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingVertical: height * 0.015,
    },
    equipmentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        borderRadius: 12.5,
        width: 25,
        height: 25,
        marginRight: width * 0.03,
    },
    equipmentName: {
        fontWeight: '700',
        fontSize: width * 0.045,
    },
    equipmentActions: {
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

export default Temperature;