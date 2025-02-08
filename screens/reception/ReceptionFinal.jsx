import React, {useContext, useEffect, useState} from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    Image,
    Modal,
    StyleSheet,
    Dimensions,
    ScrollView,
    Alert
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import axiosConfig from "../../helpers/axiosConfig";
import Toast from "react-native-toast-message";
import {AuthContext} from "../../context/AuthProvider"; // Make sure to install axios

const { width, height } = Dimensions.get('window');

const ReceptionFinal = ({ navigation, route }) => {
    const [selectedNonConformity, setSelectedNonConformity] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const [allForms, setAllForms] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const {user} = useContext(AuthContext)

    useEffect(() => {
        if (route.params?.formData) {
            setAllForms(prev => [...prev, route.params.formData]);
            console.log(allForms);
        }
    }, [route.params]);

    const nonConformities = [
        { id: 1, text: "Horaire non respecté" },
        { id: 2, text: "Date non respectée" },
        { id: 3, text: "Prix non conforme" },
        { id: 4, text: "Quantitée non conforme" },
        { id: 5, text: "Autre" }
    ];

    const handlePress = (id) => {
        setSelectedNonConformity(id);
        setImage(null);
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission refusée", "Vous avez refusé l'accès à la caméra.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (allForms.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Aucune donnée de réception n\'a été enregistrée.'
            });
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        const lastForm = allForms[allForms.length - 1];

        formData.append('reference', lastForm.reference);
        formData.append('date', lastForm.deliveryDate);
        formData.append('supplier_id', lastForm.selectedSupplier);
        formData.append('service', lastForm.selectedService);
        formData.append('additional_informations', lastForm.additionalInfo);

        lastForm.products.forEach((product, index) => {
            formData.append(`products[${index}][product_id]`, product.id);
            formData.append(`products[${index}][quantity]`, product.quantity.toString());
        });

        if (selectedNonConformity) {
            formData.append('non_compliance_reason', nonConformities[selectedNonConformity - 1].text);
        }

        if (image) {
            formData.append('non_compliance_picture', {
                uri: image,
                type: 'image/jpeg',
                name: 'non_compliance_picture.jpg'
            });
        }

        if (lastForm.referencePicture) {
            formData.append('reference_picture', {
                uri: lastForm.referencePicture,
                type: 'image/jpeg',
                name: 'reference_picture.jpg'
            });
        }

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            const response = await axiosConfig.post('/reception/new', formData);
            console.log('Reception created successfully:', response.data);
            Toast.show({
                type: 'success',
                text1: 'Réception finalisée 🟢',
                text2: 'La réception a été enregistrée avec succès.'
            });
            navigation.navigate('Accueil'); // Adjust this to your navigation structure
        } catch (error) {
            console.error('Error creating reception:', error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur 🔴',
                text2: 'Une erreur s\'est produite lors de la finalisation de la réception.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    <View style={styles.nonConformityContainer}>
                        <Text style={styles.title}>Livraison non conforme ?</Text>
                        <View style={styles.optionsContainer}>
                            {nonConformities.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.option,
                                        selectedNonConformity === item.id && styles.selectedOption
                                    ]}
                                    onPress={() => handlePress(item.id)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedNonConformity === item.id && styles.selectedOptionText
                                    ]}>
                                        {item.text}
                                    </Text>
                                    {selectedNonConformity === item.id && (
                                        <TouchableOpacity onPress={takePhoto}>
                                            <FontAwesome name="camera" size={22} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        {image && (
                            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.imagePreview}>
                                <Image source={{ uri: image }} style={styles.image} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <FontAwesome name="close" size={24} color="black" />
                            </TouchableOpacity>
                            <Image
                                source={{ uri: image }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <CustomButton
                    title="Finaliser la réception"
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
    scrollContent: {
        flexGrow: 1,
        paddingBottom: height * 0.15,
    },
    content: {
        flex: 1,
        paddingHorizontal: width * 0.04,
        paddingTop: height * 0.03,
    },
    nonConformityContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 16,
        padding: width * 0.04,
    },
    title: {
        textAlign: 'center',
        fontSize: width * 0.045,
        fontWeight: 'bold',
        marginBottom: height * 0.02,
    },
    optionsContainer: {
        gap: height * 0.015,
    },
    option: {
        backgroundColor: '#F5F5F5',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        padding: width * 0.05,
        flexDirection: 'row',
    },
    selectedOption: {
        backgroundColor: '#008170',
    },
    optionText: {
        fontSize: width * 0.045,
    },
    selectedOptionText: {
        color: 'white',
    },
    imagePreview: {
        marginTop: height * 0.02,
    },
    image: {
        width: '100%',
        height: height * 0.2,
        borderRadius: 8,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: height * 0.03,
        left: width * 0.04,
        right: width * 0.04,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: width * 0.02,
        width: width * 0.92,
        height: height * 0.7,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: height * 0.01,
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
});

export default ReceptionFinal;