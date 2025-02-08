import React, { useState, useContext } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Alert, Dimensions } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import DateTimeField from "../../components/DateTimeField";
import { CheckBox } from "@rneui/base";
import CounterInput from "react-native-counter-input";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";

const { width, height } = Dimensions.get('window');

const TcpOperation = ({ route, navigation }) => {
    const { user } = useContext(AuthContext);
    const [showEndProcess, setShowEndProcess] = useState(false);
    const [startTemp, setStartTemp] = useState(operationType === 'Refroidissement' ? 0 : 63);
    const [endTemp, setEndTemp] = useState(operationType === 'Refroidissement' ? 0 : 63);
    const [selectedAction, setSelectedAction] = useState(null);
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { selectedProducts, operationType, storageLocation, additionalInfo } = route.params;

    // Vérifier si c'est une opération avec timer
    const isTimedOperation = operationType === 'Refroidissement' || operationType === 'Remise en T°C';

    const renderTempControl = (temp, setTemp, isEndTemp = false) => {
        const isCoolingOperation = operationType === 'Refroidissement';
        const isColdLinkOrReheating = operationType === 'Liaison froide' || operationType === 'Remise en T°C';

        const isInvalidTemperature = isEndTemp
            ? ((temp < startTemp && !isColdLinkOrReheating && !isCoolingOperation) ||
                (temp > startTemp && isCoolingOperation))
            : (temp < 63 && !isColdLinkOrReheating);

        return (
            <CounterInput
                horizontal={true}
                increaseButtonBackgroundColor="#008170"
                decreaseButtonBackgroundColor="#008170"
                min={isColdLinkOrReheating ? undefined : 0}
                initial={isColdLinkOrReheating ? 0 : 63}
                value={temp}
                onChange={(counter) => setTemp(counter)}
                reverseCounterButtons
                style={[
                    styles.tempControl,
                    isInvalidTemperature && styles.tempControlRed
                ]}
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

        if (!isTimedOperation && showEndProcess && (!endDateTime || new Date(endDateTime) <= new Date(startDateTime))) {
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
                storage_location: storageLocation,
                date: startDateTime,
                additional_informations: additionalInfo || '',
                start_date: startDateTime,
                start_temperature: startTemp.toString(),
                is_finished: '0',
                products: selectedProducts.map(product => ({ product_id: product.productId })),
            };

            if (!isTimedOperation && showEndProcess) {
                if (!endDateTime) {
                    throw new Error("Date de fin invalide");
                }
                data.is_finished = '1';
                data.end_date = endDateTime;
                data.end_temperature = endTemp.toString();
            } else if (!isTimedOperation && selectedAction !== null) {
                data.corrective_action = ['Opération prolongée', 'Produit jeté', 'Réduction durée de vie produit'][selectedAction];
            }

            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            const response = await axiosConfig.post('/tcp/new', data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            Alert.alert('Succès', 'Tcp créé avec succès');
            navigation.navigate('Tcp', { newTcpCreated: true });
        } catch (error) {
            let errorMessage = 'Une erreur est survenue lors de la création du TCP';
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
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Température de début</Text>
                    {renderTempControl(startTemp, setStartTemp, false)}
                </View>

                {!isTimedOperation && (
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
                )}

                {!isTimedOperation && showEndProcess && (
                    <>
                        <View style={styles.section}>
                            <DateTimeField
                                title="Date et heure de fin"
                                onChange={handleEndDateTimeChange}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Température de fin</Text>
                            {renderTempControl(endTemp, setEndTemp, true)}
                        </View>
                    </>
                )}

                {!isTimedOperation && !showEndProcess && (
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
                    title="Enregistrer"
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
        shadowColor: 'none'
    },
    tempControlRed: {
        backgroundColor: '#FFCCCB',
    },
});

export default TcpOperation;
