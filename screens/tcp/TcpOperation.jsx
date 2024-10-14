import React, { useState, useEffect, useRef, useContext } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Alert, Dimensions } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import DateTimeField from "../../components/DateTimeField";
import { CheckBox } from "@rneui/base";
import CounterInput from "react-native-counter-input";
import * as Notifications from 'expo-notifications';
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";

const { width, height } = Dimensions.get('window');

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const TcpOperation = ({ route, navigation }) => {
    const { user } = useContext(AuthContext);
    const [showEndProcess, setShowEndProcess] = useState(false);
    const [startTemp, setStartTemp] = useState(63);
    const [endTemp, setEndTemp] = useState(63);
    const [selectedAction, setSelectedAction] = useState(null);
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [remainingTime, setRemainingTime] = useState(7200); // 2 hours in seconds
    const [isLoading, setIsLoading] = useState(false);

    const { selectedProducts, operationType, additionalInfo } = route.params;

    const timerRef = useRef(null);

    useEffect(() => {
        if (operationType === 'Refroidissement') {
            startTimer();
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [operationType]);

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime <= 0) {
                    clearInterval(timerRef.current);
                    sendNotification();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    const sendNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Alerte de refroidissement",
                body: "Le temps de refroidissement de 2 heures est écoulé. Vérifiez la température.",
            },
            trigger: null,
        });
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const renderTempControl = (temp, setTemp) => (
        <CounterInput
            horizontal={true}
            increaseButtonBackgroundColor="#008170"
            decreaseButtonBackgroundColor="#008170"
            className="w-full rounded-xl h-16 border-[1px] border-secondary shadow-none"
            min={0}
            value={temp}
            onChange={(counter) => setTemp(counter)}
            reverseCounterButtons
        />
    );

    const handleStartDateTimeChange = (dateTime) => {
        console.log('Start DateTime changed:', dateTime);
        setStartDateTime(dateTime);
    };

    const handleEndDateTimeChange = (dateTime) => {
        console.log('End DateTime changed:', dateTime);
        setEndDateTime(dateTime);
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
            const response = await axiosConfig.post('/tcp/new', data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Response:', response.data);
            Alert.alert('Succès', 'Tcp créé avec succès');
            navigation.navigate('Accueil');
        } catch (error) {
            console.error('Error creating TCP:', error);
            let errorMessage = 'Une erreur est survenue lors de la création du TCP';
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={[
                        styles.headerText,
                        operationType === 'Refroidissement' && remainingTime <= 0 ? styles.headerTextRed : null
                    ]}>
                        {operationType}
                    </Text>
                </View>

                {operationType === 'Refroidissement' && (
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>Temps restant: {formatTime(remainingTime)}</Text>
                    </View>
                )}

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
                    {renderTempControl(startTemp, setStartTemp)}
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
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Température de fin</Text>
                            {renderTempControl(endTemp, setEndTemp)}
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
    headerTextRed: {
        color: 'red',
    },
    timerContainer: {
        alignItems: 'center',
        marginVertical: height * 0.01,
    },
    timerText: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        color: '#008170',
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
});

export default TcpOperation;