import React, {useState, useContext, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View, ScrollView, Alert, Dimensions} from "react-native";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import DateTimeField from "../../components/DateTimeField";
import {CheckBox} from "@rneui/base";
import CounterInput from "react-native-counter-input";
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";
import Toast from "react-native-toast-message";

const {width, height} = Dimensions.get('window');
const scale = Math.min(width, height) / 375;
const responsiveSize = (size) => size * scale;

const TcpEdit = ({route, navigation}) => {
    const {user} = useContext(AuthContext);
    const [tcp, setTcp] = useState(null);
    const [showEndProcess, setShowEndProcess] = useState(false);
    const [startTemp, setStartTemp] = useState(null);
    const [endTemp, setEndTemp] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [operationType, setOperationType] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [styles, setStyles] = useState(createStyles(width, height));

    const {id} = route.params;

    useEffect(() => {
        fetchTcpData();

        const updateStyles = () => {
            const {width, height} = Dimensions.get('window');
            setStyles(createStyles(width, height));
        };

        Dimensions.addEventListener('change', updateStyles);

        return () => {
            Dimensions.removeEventListener('change', updateStyles);
        };
    }, [id]);

    const fetchTcpData = async () => {
        try {
            const response = await axiosConfig.get(`/tcp/${id}`);
            const tcpData = response.data;
            setTcp(tcpData);
            setOperationType(tcpData.operation_type);

            const parsedStartTemp = parseInt(tcpData.start_temperature) || 0;
            const parsedEndTemp = parseInt(tcpData.end_temperature) || 0;

            setStartTemp(parsedStartTemp);
            setEndTemp(parsedEndTemp);

            setStartDateTime(tcpData.start_date);
            setEndDateTime(tcpData.end_date);
            setShowEndProcess(!!tcpData.end_date);
            setSelectedProducts(tcpData.products.map(product => ({
                productId: product.id,
                productName: product.name
            })));
            setAdditionalInfo(tcpData.additional_informations || '');
            setSelectedAction(getActionIndex(tcpData.corrective_action));
        } catch (error) {
            console.error('Error fetching TCP data:', error);
            Alert.alert('Erreur', 'Impossible de récupérer les données du TCP');
        }
    };

    const getActionIndex = (action) => {
        const actions = ['Opération prolongée', 'Produit jeté', 'Réduction durée de vie produit'];
        return actions.indexOf(action);
    };

    const renderTempControl = (temp, setTemp, isEndTemp = false) => {
        return (
            <CounterInput
                horizontal={true}
                increaseButtonBackgroundColor="#008170"
                decreaseButtonBackgroundColor="#008170"
                style={[
                    styles.tempControl,
                    (isEndTemp ?
                            (temp < startTemp && operationType !== 'Liaison froide' && operationType !== 'Remise en T°C') :
                            (temp < 63 && operationType !== 'Liaison froide' && operationType !== 'Remise en T°C')
                    ) && styles.tempControlRed
                ]}
                min={operationType === 'Liaison froide' || operationType === 'Remise en T°C' ? undefined : 0}
                initial={temp}
                value={temp}
                onChange={setTemp}
                reverseCounterButtons
            />
        );
    };

    const handleStartDateTimeChange = (dateTime) => {
        setStartDateTime(dateTime);
    };

    const handleEndDateTimeChange = (dateTime) => {
        if (new Date(dateTime) <= new Date(startDateTime)) {
            Alert.alert(
                "Date de fin invalide",
                "La date et l'heure de fin doivent être postérieures à la date et l'heure de début.",
                [{text: "OK"}]
            );
        } else {
            setEndDateTime(dateTime);
        }
    };

    const handleSubmit = async () => {
        if (selectedProducts.length === 0) {
            Alert.alert(
                "Aucun produit sélectionné",
                "Veuillez sélectionner au moins un produit avant de soumettre.",
                [{text: "OK"}]
            );
            return;
        }

        if (!startDateTime) {
            Alert.alert(
                "Date de début invalide",
                "Veuillez sélectionner une date et heure de début valides.",
                [{text: "OK"}]
            );
            return;
        }

        if (showEndProcess && (!endDateTime || new Date(endDateTime) <= new Date(startDateTime))) {
            Alert.alert(
                "Date de fin invalide",
                "La date et l'heure de fin doivent être postérieures à la date et l'heure de début.",
                [{text: "OK"}]
            );
            return;
        }

        setIsLoading(true);

        try {
            const data = {
                user_id: user.id,
                operation_type: operationType,
                date: startDateTime,
                additional_informations: additionalInfo || '',
                start_date: startDateTime,
                start_temperature: startTemp.toString(),
                products: selectedProducts.map(product => ({product_id: product.productId})),
            };

            if (endDateTime && endTemp !== null) {
                data.is_finished = true;
                data.end_date = endDateTime;
                data.end_temperature = endTemp.toString();
            } else {
                data.is_finished = false;
                if (selectedAction !== null) {
                    data.corrective_action = ['Opération prolongée', 'Produit jeté', 'Réduction durée de vie produit'][selectedAction];
                }
            }

            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            const response = await axiosConfig.put(`/temperatures-changement/${id}/edit`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            Toast.show({
                type: 'success',
                text1: 'Tcp modifié avec succès 🟢',
            });
            navigation.navigate('Tcp', {tcpUpdated: true});
        } catch (error) {
            console.error('Error updating TCP:', error);
            let errorMessage = 'Une erreur est survenue lors de la modification du TCP';
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            Alert.alert('Erreur', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>
                        {operationType}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Produits sélectionnés</Text>
                    {selectedProducts.map((product, index) => (
                        <Text key={index} style={styles.productItem}>{product.productName}</Text>
                    ))}
                </View>

                <View style={styles.section}>
                    <DateTimeField
                        title="Date et heure de début"
                        onChange={handleStartDateTimeChange}
                        initialValue={startDateTime}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Température de début</Text>
                    {startTemp !== null && renderTempControl(startTemp, setStartTemp, false)}
                </View>

                <View style={styles.section}>
                    <CheckBox
                        title="Renseigner la fin du processus maintenant"
                        checked={showEndProcess}
                        onPress={() => setShowEndProcess(!showEndProcess)}
                        checkedIcon={<AntDesign name="checkcircle" size={responsiveSize(24)} color="#008170"/>}
                        uncheckedIcon={<FontAwesome name="circle-o" size={responsiveSize(24)} color="#8F9098"/>}
                        containerStyle={styles.checkboxContainer}
                        textStyle={styles.checkboxText}
                    />
                </View>

                {showEndProcess && (
                    <>
                        <View style={styles.section}>
                            <DateTimeField
                                title="Date et heure de fin"
                                onChange={handleEndDateTimeChange}
                                initialValue={endDateTime}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Température de fin</Text>
                            {endTemp !== null && renderTempControl(endTemp, setEndTemp, true)}
                        </View>
                    </>
                )}

                {!showEndProcess && (
                    <View style={styles.section}>
                        <Text style={styles.actionTitle}>Actions correctives</Text>
                        {['Opération prolongée', 'Produit jeté', 'Réduction durée de vie produit'].map((action, index) => (
                            <CheckBox
                                key={index}
                                title={action}
                                checked={selectedAction === index}
                                onPress={() => setSelectedAction(index)}
                                checkedIcon={<AntDesign name="checkcircle" size={responsiveSize(24)} color="#008170"/>}
                                uncheckedIcon={<FontAwesome name="circle-o" size={responsiveSize(24)} color="#8F9098"/>}
                                containerStyle={styles.actionCheckbox}
                                textStyle={styles.actionText}
                            />
                        ))}
                    </View>
                )}

                {additionalInfo && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informations complémentaires</Text>
                        <Text style={styles.additionalInfo}>{additionalInfo}</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <CustomButton
                    title="Mettre à jour"
                    handlePress={handleSubmit}
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
};

const createStyles = (width, height) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        flexGrow: 1,
        padding: responsiveSize(16),
    },
    headerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: responsiveSize(16),
        padding: responsiveSize(12),
        marginBottom: responsiveSize(16),
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    headerText: {
        fontSize: responsiveSize(18),
        fontWeight: 'bold',
        textAlign: 'center',
        includeFontPadding: false,
    },
    section: {
        marginBottom: responsiveSize(16),
    },
    sectionTitle: {
        fontSize: responsiveSize(16),
        fontWeight: 'bold',
        marginBottom: responsiveSize(8),
        includeFontPadding: false,
    },
    productItem: {
        textAlign: 'center',
        fontSize: responsiveSize(14),
        marginBottom: responsiveSize(4),
        includeFontPadding: false,
    },
    checkboxContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        marginLeft: 0,
    },
    checkboxText: {
        fontWeight: 'normal',
        fontSize: responsiveSize(14),
        includeFontPadding: false,
    },
    actionTitle: {
        fontSize: responsiveSize(16),
        fontWeight: 'bold',
        marginBottom: responsiveSize(8),
        includeFontPadding: false,
    },
    actionCheckbox: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        marginLeft: 0,
        marginBottom: responsiveSize(4),
    },
    actionText: {
        fontWeight: 'normal',
        fontSize: responsiveSize(14),
        includeFontPadding: false,
    },
    buttonContainer: {
        padding: responsiveSize(16),
        paddingBottom: responsiveSize(20),
    },
    additionalInfo: {
        fontSize: responsiveSize(14),
        color: '#333',
        includeFontPadding: false,
    },
    tempControl: {
        borderRadius: responsiveSize(12),
        height: responsiveSize(64),
        borderWidth: 1,
        borderColor: '#C5C6CC',
    },
    tempControlRed: {
        backgroundColor: '#FFCCCB',
    },
});

export default TcpEdit;