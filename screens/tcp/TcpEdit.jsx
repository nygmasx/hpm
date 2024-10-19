import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Alert, Dimensions } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import DateTimeField from "../../components/DateTimeField";
import { CheckBox } from "@rneui/base";
import CounterInput from "react-native-counter-input";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";

const { width, height } = Dimensions.get('window');

const TcpEdit = ({ route, navigation }) => {
    const { user } = useContext(AuthContext);
    const [tcp, setTcp] = useState(null);
    const [showEndProcess, setShowEndProcess] = useState(false);
    const [startTemp, setStartTemp] = useState(0);
    const [endTemp, setEndTemp] = useState(0);
    const [selectedAction, setSelectedAction] = useState(null);
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [operationType, setOperationType] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const { id } = route.params;

    useEffect(() => {
        fetchTcpData();
    }, [id]);

    const fetchTcpData = async () => {
        try {
            const response = await axiosConfig.get(`/tcp/${id}`);
            const tcpData = response.data;
            setTcp(tcpData);
            setOperationType(tcpData.operation_type);
            setStartTemp(parseInt(tcpData.start_temperature));
            setEndTemp(parseInt(tcpData.end_temperature));
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

    const renderTempControl = (temp, setTemp, isEndTemp = false, startTemp = 63) => (
        <CounterInput
            horizontal={true}
            increaseButtonBackgroundColor="#008170"
            decreaseButtonBackgroundColor="#008170"
            className="w-full rounded-xl h-16 border-[1px] border-secondary shadow-none"
            min={operationType === 'Refroidissement' ? undefined : 0}
            initial={temp}
            value={temp}
            onChange={(counter) => setTemp(counter)}
            reverseCounterButtons
            style={[
                styles.tempControl,
                (isEndTemp ?
                        (temp < startTemp && operationType !== 'Refroidissement') :
                        (temp < 63 && operationType !== 'Refroidissement')
                ) && styles.tempControlRed
            ]}
        />
    );

    const handleStartDateTimeChange = (dateTime) => {
        console.log('Start DateTime changed:', dateTime);
        setStartDateTime(dateTime);
    };

    const handleEndDateTimeChange = (dateTime) => {
        console.log('End DateTime changed:', dateTime);
        if (new Date(dateTime) <= new Date(startDateTime)) {
            Alert.alert(
                "Date de fin invalide",
                "La date et l'heure de fin doivent être postérieures à la date et l'heure de début.",
                [{ text: "OK" }]
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
                [{ text: "OK" }]
            );
            return;
        }

        if (!startDateTime) {
            Alert.alert(
                "Date de début invalide",
                "Veuillez sélectionner une date et heure de début valides.",
                [{ text: "OK" }]
            );
            return;
        }

        if (showEndProcess && (!endDateTime || new Date(endDateTime) <= new Date(startDateTime))) {
            Alert.alert(
                "Date de fin invalide",
                "La date et l'heure de fin doivent être postérieures à la date et l'heure de début.",
                [{ text: "OK" }]
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
                is_finished: showEndProcess ? '1' : '0',
                products: selectedProducts.map(product => ({ product_id: product.productId })),
            };

            if (showEndProcess) {
                if (!endDateTime) {
                    throw new Error("Date de fin invalide");
                }
                data.end_date = endDateTime;
                data.end_temperature = endTemp.toString();
            } else if (selectedAction !== null) {
                data.corrective_action = ['Opération prolongée', 'Produit jeté', 'Réduction durée de vie produit'][selectedAction];
            }

            console.log('Submitting data:', JSON.stringify(data, null, 2));

            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            const response = await axiosConfig.put(`/temperatures-changement/${id}/edit`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Response:', response.data);
            Alert.alert('Succès', 'Tcp modifié avec succès');
            navigation.navigate('Tcp', { tcpUpdated: true });
        } catch (error) {
            console.error('Error updating TCP:', error);
            let errorMessage = 'Une erreur est survenue lors de la modification du TCP';
            if (error.response) {
                console.error('Error response:', error.response.data);
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            Alert.alert('Erreur', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!tcp) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Chargement...</Text>
            </SafeAreaView>
        );
    }

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
                    {renderTempControl(startTemp, setStartTemp, false)}
                </View>

                <View style={styles.section}>
                    <CheckBox
                        title="Renseigner la fin du processus maintenant"
                        checked={showEndProcess}
                        onPress={() => setShowEndProcess(!showEndProcess)}
                        checkedIcon={<AntDesign name="checkcircle" size={24} color="#008170"/>}
                        uncheckedIcon={<FontAwesome name="circle-o" size={24} color="#8F9098"/>}
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
                            {renderTempControl(endTemp, setEndTemp, true, startTemp)}
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
                                checkedIcon={<AntDesign name="checkcircle" size={24} color="#008170"/>}
                                uncheckedIcon={<FontAwesome name="circle-o" size={24} color="#8F9098"/>}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        flexGrow: 1,
        padding: width * 0.04,
    },
    headerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 16,
        padding: height * 0.015,
        marginBottom: height * 0.02,
    },
    headerText: {
        fontSize: width * 0.045,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    section: {
        marginBottom: height * 0.02,
    },
    sectionTitle: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        marginBottom: height * 0.01,
    },
    productItem: {
        textAlign: 'center',
        fontSize: width * 0.035,
        marginBottom: height * 0.005,
    },
    checkboxContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        marginLeft: 0,
    },
    checkboxText: {
        fontWeight: 'normal',
        fontSize: width * 0.035,
    },
    actionTitle: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        marginBottom: height * 0.01,
    },
    actionCheckbox: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        marginLeft: 0,
        marginBottom: height * 0.005,
    },
    actionText: {
        fontWeight: 'normal',
        fontSize: width * 0.035,
    },
    buttonContainer: {
        padding: width * 0.04,
        paddingBottom: height * 0.05,
    },
    additionalInfo: {
        fontSize: width * 0.035,
        color: '#333',
    },
    tempControl: {
        // Add any additional styles for the temperature control here
    },
    tempControlRed: {
        backgroundColor: '#FFCCCB', // Light red background
    },
});

export default TcpEdit;