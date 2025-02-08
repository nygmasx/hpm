import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Dimensions,
    Platform,
    TouchableOpacity,
    Alert,
    Image
} from "react-native";
import FormField from "../../components/FormField";
import DateTimeField from "../../components/DateTimeField";
import CustomButton from "../../components/CustomButton";
import { Chip } from "react-native-paper";
import { SelectList } from "react-native-dropdown-select-list";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";
import Toast from "react-native-toast-message";
import Modal from "react-native-modal";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const { width, height } = Dimensions.get('window');

const NouvelleReception = ({ navigation }) => {
    const [formData, setFormData] = useState({
        reference: '',
        deliveryDate: '',
        selectedSupplier: null,
        selectedService: null,
        additionalInfo: '',
    });
    const [image, setImage] = useState(null);
    const [imageInfo, setImageInfo] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSupplierModalVisible, setIsSupplierModalVisible] = useState(false);
    const [supplierName, setSupplierName] = useState('');
    const { user, token } = useContext(AuthContext);

    const serviceOptions = useMemo(() => ['Matin', 'Midi', 'Soir', 'Indifférent'], []);

    const fetchUserSuppliers = useCallback(() => {
        setIsLoading(true);
        axiosConfig.get(`/user/${user.id}/suppliers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                setSuppliers(response.data.map(supplier => ({
                    key: supplier.id.toString(),
                    value: supplier.name
                })));
            })
            .catch(error => {
                console.error("Error fetching suppliers:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Erreur lors de la récupération des fournisseurs',
                    text2: 'Veuillez réessayer plus tard',
                });
            })
            .finally(() => setIsLoading(false));
    }, [user.id, token]);

    useEffect(() => {
        fetchUserSuppliers();
    }, [fetchUserSuppliers]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const renderChips = useCallback(() => (
        serviceOptions.map((service) => (
            <Chip
                key={service}
                style={[
                    styles.chip,
                    formData.selectedService === service && styles.selectedChip
                ]}
                textStyle={[
                    styles.chipText,
                    formData.selectedService === service && styles.selectedChipText
                ]}
                onPress={() => handleInputChange('selectedService', service)}
            >
                {service}
            </Chip>
        ))
    ), [serviceOptions, formData.selectedService, handleInputChange]);

    const handleSubmit = useCallback(() => {
        if ((!formData.reference && !image) || !formData.deliveryDate || !formData.selectedSupplier || !formData.selectedService) {
            Toast.show({
                type: 'error',
                text1: 'Veuillez remplir tous les champs obligatoires',
                text2: 'Une référence ou une photo est requise',
            });
        } else {
            navigation.navigate('Reception Produit', {
                formData: {
                    ...formData,
                    deliveryDate: formData.deliveryDate,
                    referencePicture: image
                }
            });
        }
    }, [formData, navigation, image]);

    const sendSupplierData = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', supplierName);

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/supplier/new', formData);
            await fetchUserSuppliers();
            setIsSupplierModalVisible(!isSupplierModalVisible);
            Toast.show({
                type: 'success',
                text1: 'Fournisseur ajouté 🟢',
            });
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleModal = () => {
        setIsSupplierModalVisible(!isSupplierModalVisible);
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
            const uri = result.assets[0].uri;
            const fileInfo = await FileSystem.getInfoAsync(uri);
            setImage(uri);
            setImageInfo({
                size: (fileInfo.size / 1024 / 1024).toFixed(2), // Convert to MB
                fileName: uri.split('/').pop(),
                dateCapture: new Date().toLocaleString()
            });
            // Reset reference when image is captured
            handleInputChange('reference', '');
        }
    };

    const removeImage = () => {
        setImage(null);
        setImageInfo(null);
    };

    const renderReferenceInput = () => {
        if (image) {
            return (
                <View style={styles.imageCard}>
                    <Image source={{ uri: image }} style={styles.capturedImage} />
                    <View style={styles.imageInfo}>
                        <Text style={styles.imageInfoText}>Nom: {imageInfo?.fileName}</Text>
                        <Text style={styles.imageInfoText}>Taille: {imageInfo?.size} MB</Text>
                        <Text style={styles.imageInfoText}>Date: {imageInfo?.dateCapture}</Text>
                    </View>
                    <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                        <FontAwesome name="trash" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.referenceInputContainer}>
                <View style={styles.referenceInput}>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#7b7b8b"
                        value={formData.reference}
                        onChangeText={(text) => handleInputChange('reference', text)}
                        placeholder="Saisir une référence"
                    />
                </View>
                <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                    <FontAwesome name="camera" size={20} color="white" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Modal isVisible={isSupplierModalVisible}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Ajouter un fournisseur</Text>
                        <View style={styles.formField}>
                            <FormField title="Nom du fournisseur" value={supplierName} handleChangeText={setSupplierName} />
                        </View>
                    </View>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={sendSupplierData}>
                            <Text style={styles.confirmButtonText}>Confirmer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={50}
            >
                <ScrollView style={styles.scrollView}>
                    <View style={styles.content}>
                        <View style={styles.referenceContainer}>
                            <View style={styles.referenceContent}>
                                <Text style={styles.sectionTitle}>Référence Bon de Livraison / Facture</Text>
                                {renderReferenceInput()}
                            </View>
                        </View>
                        <View style={styles.dateContainer}>
                            <DateTimeField
                                title="Date de livraison"
                                onChange={(date) => handleInputChange('deliveryDate', date)}
                            />
                        </View>
                        <View style={styles.supplierContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Fournisseur</Text>
                                <TouchableOpacity onPress={toggleModal} style={styles.addButton}>
                                    <Text style={{fontSize: 20, color: "#008170"}}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <SelectList
                                setSelected={(value) => handleInputChange('selectedSupplier', value)}
                                data={suppliers}
                                save="key"
                                boxStyles={styles.select}
                                placeholder="Choisir un fournisseur"
                                search={true}
                                loading={isLoading}
                            />
                        </View>
                        <View style={styles.serviceContainer}>
                            <Text style={styles.sectionTitle}>Durant quel service ?</Text>
                            <View style={styles.chipContainer}>
                                {renderChips()}
                            </View>
                        </View>
                        <FormField
                            title="Informations complémentaires"
                            value={formData.additionalInfo}
                            handleChangeText={(text) => handleInputChange('additionalInfo', text)}
                        />
                    </View>
                </ScrollView>
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Valider la saisie"
                        handlePress={handleSubmit}
                        isLoading={isLoading}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.03,
    },
    referenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.02,
    },
    referenceContent: {
        flex: 1,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: width * 0.045,
        marginBottom: height * 0.01,
    },
    referenceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    referenceInput: {
        borderWidth: 1,
        borderColor: '#C5C6CC',
        width: '85%',
        height: height * 0.07,
        paddingHorizontal: width * 0.04,
        borderRadius: 12,
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontWeight: '500',
        fontSize: width * 0.045,
    },
    dateContainer: {
        marginBottom: height * 0.02,
    },
    supplierContainer: {
        marginBottom: height * 0.02,
        gap: 2,
    },
    select: {
        width: "100%",
        paddingVertical: height * 0.025,
        borderStyle: "solid",
        borderRadius: 12,
        borderColor: "#C5C6CC",
    },
    serviceContainer: {
        marginBottom: height * 0.02,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: width * 0.02,
    },
    chip: {
        borderRadius: 16,
        backgroundColor: '#EAF2FF',
    },
    selectedChip: {
        backgroundColor: '#008170',
    },
    chipText: {
        color: '#008170',
        textTransform: 'uppercase',
    },
    selectedChipText: {
        color: 'white',
    },
    buttonContainer: {
        paddingHorizontal: width * 0.04,
        paddingBottom: height * 0.05,
    },
    equipmentSection: {
        marginTop: height * 0.04,
        justifyContent: "center",
        alignItems: 'center'
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: "baseline",
        gap: 10,
        marginBottom: height * 0.005,
    },
    cameraButton: {
        borderRadius: 22.5,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#008170',
    },
    addButton: {
        padding: 5,
    },
    modalContent: {
        padding: width * 0.06,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
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
    formField: {
        marginTop: height * 0.02,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
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
    imageCard: {
        borderWidth: 1,
        borderColor: '#C5C6CC',
        borderRadius: 12,
        padding: width * 0.03,
        marginTop: height * 0.01,
    },
    capturedImage: {
        width: '100%',
        height: height * 0.2,
        borderRadius: 8,
        marginBottom: height * 0.01,
        resizeMode: 'cover',
    },
    imageInfo: {
        marginTop: height * 0.01,
    },
    imageInfoText: {
        fontSize: width * 0.035,
        color: '#666',
        marginBottom: 4,
    },
    removeImageButton: {
        position: 'absolute',
        top: width * 0.03,
        right: width * 0.03,
        backgroundColor: '#FF4444',
        borderRadius: 20,
        padding: 8,
        zIndex: 1,
    },
});

export default React.memo(NouvelleReception);