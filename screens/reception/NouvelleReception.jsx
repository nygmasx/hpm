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
    Platform
} from "react-native";
import FormField from "../../components/FormField";
import DateTimeField from "../../components/DateTimeField";
import CustomButton from "../../components/CustomButton";
import { Chip } from "react-native-paper";
import { SelectList } from "react-native-dropdown-select-list";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get('window');

const NouvelleReception = ({ navigation }) => {
    const [formData, setFormData] = useState({
        reference: '',
        deliveryDate: new Date(),
        selectedSupplier: null,
        selectedService: null,
        additionalInfo: '',
    });
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
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
        if (!formData.reference || !formData.deliveryDate || !formData.selectedSupplier || !formData.selectedService) {
            Toast.show({
                type: 'error',
                text1: 'Veuillez remplir tous les champs obligatoires',
            });
        } else {
            navigation.navigate('Reception Produit', {
                formData: {
                    ...formData,
                    deliveryDate: formData.deliveryDate.toISOString().slice(0, 19).replace('T', ' '),
                }
            });
        }
    }, [formData, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={120}
            >
                <ScrollView style={styles.scrollView}>
                    <View style={styles.content}>
                        <View style={styles.referenceContainer}>
                            <View style={styles.referenceContent}>
                                <Text style={styles.sectionTitle}>Référence Bon de Livraison / Facture</Text>
                                <View style={styles.referenceInputContainer}>
                                    <View style={styles.referenceInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholderTextColor="#7b7b8b"
                                            value={formData.reference}
                                            onChangeText={(text) => handleInputChange('reference', text)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.dateContainer}>
                            <DateTimeField
                                title="Date de livraison"
                                value={formData.deliveryDate}
                                onChange={(date) => handleInputChange('deliveryDate', date)}
                            />
                        </View>
                        <View style={styles.supplierContainer}>
                            <Text style={styles.sectionTitle}>Fournisseur</Text>
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
        width: '100%',
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
});

export default React.memo(NouvelleReception);