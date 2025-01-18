import React, {useContext, useEffect, useState} from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from "react-native";
import DateTimeField from "../../components/DateTimeField";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import CheckBox from "expo-checkbox";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import FormField from "../../components/FormField";
import axiosConfig from "../../helpers/axiosConfig";
import Toast from "react-native-toast-message";
import {AuthContext} from "../../context/AuthProvider";
import * as ImageManipulator from "expo-image-manipulator";

const {width, height} = Dimensions.get('window');
const scale = Math.min(width, height) / 375;
const responsiveSize = (size) => size * scale;

const Huile = ({navigation, route}) => {

    const [trayName, setTrayName] = useState('')
    const [date, setDate] = useState('')
    const [checkedOilTrays, setCheckedOilTrays] = useState({});
    const [oilTrays, setOilTrays] = useState([])
    const [selectedTrays, setSelectedTrays] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const {user} = useContext(AuthContext)

    useEffect(() => {
        if (route.params?.oilTrayData) {
            setSelectedTrays(prev => [...prev, route.params.oilTrayData]);
            console.log(selectedTrays)
        }
        fetchUserOilTrays();
    }, [route.params]);

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const fetchUserOilTrays = () => {
        axiosConfig.get(`/user/${user.id}/oil-trays`, {})
            .then(response => {
                setOilTrays(response.data)
            })
            .catch(error => {
                console.error(error)
            })
    }

    const createOilTray = async () => {
        setIsLoading(true)
        const formData = new FormData();
        formData.append('name', trayName)

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/oil-tray/new', formData);
            await fetchUserOilTrays()
            setIsModalVisible(!isModalVisible)
            Toast.show({
                type: 'success',
                text1: 'Bac à huiles enregistré 🟢'
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

    const handleCheckboxChange = (oilTrayId, oilTrayName) => {
        setCheckedOilTrays(prevState => {
            const newCheckedZones = {...prevState, [oilTrayId]: !prevState[oilTrayId]};

            // Determine if the checkbox was checked or unchecked
            const wasChecked = prevState[oilTrayId];
            const isChecked = !wasChecked;

            if (isChecked) {
                // Navigate to product detail if checked
                navigation.navigate('Détail Bac', {oilTrayId, oilTrayName});
            } else {
                // Uncheck case: Remove the product from selectedProducts
                setSelectedTrays(prevZones => {
                    const updatedOilTray = prevZones.filter(oilTray => oilTray.oilTrayId !== oilTrayId);

                    // Alert and log data when product is removed
                    Alert.alert(
                        "Bac à huile retiré",
                        `Le produit ${oilTrayName} a été retiré de la sélection.`,
                        [{text: "OK"}]
                    );
                    console.log('Updated Selected Zone:', updatedOilTray);

                    return updatedOilTray;
                });
            }

            return newCheckedZones;
        });
    };

    const resizeImage = async (uri) => {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{resize: {width: 1080}}],
            {compress: 0.8, format: ImageManipulator.SaveFormat.JPEG}
        );
        return manipResult;
    };

    const sendAllData = async () => {
        if (selectedTrays.length === 0) {
            Alert.alert("Aucun bac à huile sélectionné", "Veuillez sélectionner au moins un bac à huile avant de soumettre.", [{text: "OK"}]);
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('date', date);

            for (let trayIndex = 0; trayIndex < selectedTrays.length; trayIndex++) {
                const tray = selectedTrays[trayIndex];
                if (tray.image) {
                    const resizedImage = await resizeImage(tray.image.uri);
                    formData.append(`oil_trays[${trayIndex}][image]`, {
                        uri: resizedImage.uri,
                        name: 'image.jpg',
                        type: 'image/jpeg',
                    });
                }
                formData.append(`oil_trays[${trayIndex}][oil_tray_id]`, tray.oilTrayId);
                formData.append(`oil_trays[${trayIndex}][control_type]`, tray.controlType);
                formData.append(`oil_trays[${trayIndex}][corrective_action]`, tray.correctiveAction);
                formData.append(`oil_trays[${trayIndex}][temperature]`, tray.temperature);
                formData.append(`oil_trays[${trayIndex}][polarity]`, tray.polarity);
            }

            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            const response = await axiosConfig.post('/oil-control/new', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log(response.data.message);
            navigation.navigate('Accueil');
            Toast.show({
                type: 'success',
                text1: 'Contrôle d\'huile enregistré 🟢'
            });
            setIsModalVisible(false);
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

    const handleDateTimeChange = (dateTime) => {
        console.log('DateTime changed:', dateTime);
        setDate(dateTime);
    };

    const renderItem = ({item}) => (
        <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
                <CheckBox
                    value={!!checkedOilTrays[item.id]}
                    onValueChange={() => handleCheckboxChange(item.id, item.name)}
                    color="#008170"
                    style={styles.checkbox}
                />
                <Text style={styles.itemName}>{item.name}</Text>
            </View>
            {!item.checked && (
                <View style={styles.listItemRight}>
                    <TouchableOpacity onPress={toggleModal}>
                        <MaterialIcons name="edit" size={responsiveSize(20)} color="#008170"/>
                    </TouchableOpacity>
                    <MaterialIcons name="cancel" size={responsiveSize(20)} color="#008170"/>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Modal isVisible={isModalVisible}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Ajouter un bac à huiles</Text>
                            <View style={styles.formContainer}>
                                <FormField
                                    title="Nom du bac à huiles"
                                    value={trayName}
                                    handleChangeText={setTrayName}
                                />
                            </View>
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={toggleModal}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={createOilTray}
                            >
                                <Text style={styles.confirmButtonText}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
            <View style={styles.mainContent}>
                <DateTimeField
                    onChange={handleDateTimeChange}
                    title="Date du relevé d'huile"
                />
                <View style={styles.traysSection}>
                    <View style={styles.headerSection}>
                        <Text style={styles.sectionTitle}>Bac à huiles</Text>
                        <TouchableOpacity
                            onPress={toggleModal}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>Ajouter</Text>
                            <AntDesign name="plus" size={responsiveSize(20)} color="white"/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.listContainer}>
                        <FlatList
                            data={oilTrays}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.bottomButton}>
                <CustomButton
                    title="Valider la saisie"
                    handlePress={sendAllData}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%'
    },
    mainContent: {
        width: '100%',
        flex: 1,
        paddingHorizontal: responsiveSize(16),
        marginVertical: responsiveSize(24),
        gap: responsiveSize(32)
    },
    modalContainer: {
        padding: responsiveSize(24),
        backgroundColor: 'white',
        borderRadius: responsiveSize(16),
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    modalContent: {
        width: '100%',
        gap: responsiveSize(20)
    },
    modalTitle: {
        fontSize: responsiveSize(20),
        textAlign: 'center',
        fontWeight: '800',
        includeFontPadding: false
    },
    formContainer: {
        gap: responsiveSize(16)
    },
    modalButtons: {
        flexDirection: 'row',
        gap: responsiveSize(8),
        alignItems: 'flex-end',
        marginTop: responsiveSize(32),
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: '#008170',
        justifyContent: 'center',
        height: responsiveSize(56),
        alignItems: 'center',
        width: '48%',
        borderRadius: responsiveSize(16)
    },
    confirmButton: {
        backgroundColor: '#008170',
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveSize(56),
        width: '48%',
        borderRadius: responsiveSize(16)
    },
    cancelButtonText: {
        color: '#008170',
        fontSize: responsiveSize(16),
        fontWeight: '600',
        includeFontPadding: false
    },
    confirmButtonText: {
        color: 'white',
        fontSize: responsiveSize(16),
        fontWeight: '600',
        includeFontPadding: false
    },
    traysSection: {
        gap: responsiveSize(16)
    },
    headerSection: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: {
        fontWeight: '600',
        fontSize: responsiveSize(16),
        includeFontPadding: false
    },
    addButton: {
        paddingHorizontal: responsiveSize(8),
        paddingVertical: responsiveSize(4),
        gap: responsiveSize(8),
        backgroundColor: '#008170',
        borderRadius: responsiveSize(16),
        flexDirection: 'row',
        alignItems: 'center'
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: responsiveSize(8),
        includeFontPadding: false
    },
    listContainer: {
        gap: responsiveSize(8)
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#C5C6CC',
        padding: responsiveSize(8)
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveSize(16)
    },
    checkbox: {
        borderRadius: responsiveSize(12),
        width: responsiveSize(25),
        height: responsiveSize(25)
    },
    itemName: {
        fontWeight: 'bold',
        fontSize: responsiveSize(18),
        includeFontPadding: false
    },
    listItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveSize(4)
    },
    bottomButton: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: responsiveSize(16),
        marginBottom: responsiveSize(48)
    }
});

export default Huile;