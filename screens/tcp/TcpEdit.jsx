import React, { useState, useContext, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    ScrollView,
    Alert,
    Dimensions
} from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { CheckBox } from "@rneui/base";
import CounterInput from "react-native-counter-input";
import Toast from "react-native-toast-message";
import CustomButton from "../../components/CustomButton";
import DateTimeField from "../../components/DateTimeField";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";

const { width, height } = Dimensions.get('window');

const COLORS = {
    primary: '#008170',
    border: '#E5E5E5',
    text: '#333',
    uncheckedIcon: '#8F9098',
    errorBackground: '#FFCCCB',
    white: '#fff',
    transparent: 'transparent'
};

const FONT_SIZES = {
    header: width * 0.045,
    title: width * 0.06,
    normal: width * 0.035
};

const SPACING = {
    padding: width * 0.04,
    marginBottom: height * 0.02,
    smallMargin: height * 0.01,
    tinyMargin: height * 0.005
};

const CORRECTIVE_ACTIONS = ['Opération prolongée', 'Produit jeté', 'Réduction durée de vie produit'];

const TcpEdit = ({ route, navigation }) => {
    const { user } = useContext(AuthContext);
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
        return CORRECTIVE_ACTIONS.indexOf(action);
    };

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

    const validateSubmission = () => {
        if (selectedProducts.length === 0) {
            Alert.alert(
                "Aucun produit sélectionné",
                "Veuillez sélectionner au moins un produit avant de soumettre.",
                [{ text: "OK" }]
            );
            return false;
        }

        if (!startDateTime) {
            Alert.alert(
                "Date de début invalide",
                "Veuillez sélectionner une date et heure de début valides.",
                [{ text: "OK" }]
            );
            return false;
        }

        if (showEndProcess && (!endDateTime || new Date(endDateTime) <= new Date(startDateTime))) {
            Alert.alert(
                "Date de fin invalide",
                "La date et l'heure de fin doivent être postérieures à la date et l'heure de début.",
                [{ text: "OK" }]
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateSubmission()) return;

        setIsLoading(true);

        try {
            const data = {
                user_id: user.id,
                operation_type: operationType,
                date: startDateTime,
                additional_informations: additionalInfo || '',
                start_date: startDateTime,
                start_temperature: startTemp.toString(),
                products: selectedProducts.map(product => ({ product_id: product.productId })),
            };

            if (endDateTime && endTemp !== null) {
                data.is_finished = true;
                data.end_date = endDateTime;
                data.end_temperature = endTemp.toString();
            } else {
                data.is_finished = false;
                if (selectedAction !== null) {
                    data.corrective_action = CORRECTIVE_ACTIONS[selectedAction];
                }
            }

            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.put(`/temperatures-changement/${id}/edit`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            Toast.show({
                type: 'success',
                text1: 'Tcp modifié avec succès 🟢',
            });
            navigation.navigate('Tcp', { tcpUpdated: true });
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

    const renderCheckbox = ({ title, checked, onPress, containerStyle }) => (
        <CheckBox
            title={title}
            checked={checked}
            onPress={onPress}
            checkedIcon={<AntDesign name="checkcircle" size={24} color={COLORS.primary} />}
            uncheckedIcon={<FontAwesome name="circle-o" size={24} color={COLORS.uncheckedIcon} />}
            containerStyle={[styles.baseCheckbox, containerStyle]}
            textStyle={styles.checkboxText}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>{operationType}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Produits sélectionnés</Text>
                    {selectedProducts.map((product, index) => (
                        <Text key={`product-${product.productId}-${index}`} style={styles.productItem}>
                            {product.productName}
                        </Text>
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

                <View key="end-process-checkbox">
                    {renderCheckbox({
                        title: "Renseigner la fin du processus maintenant",
                        checked: showEndProcess,
                        onPress: () => setShowEndProcess(!showEndProcess)
                    })}
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
                        {CORRECTIVE_ACTIONS.map((action, index) => (
                            <View key={`action-${index}`}>
                                {renderCheckbox({
                                    title: action,
                                    checked: selectedAction === index,
                                    onPress: () => setSelectedAction(index),
                                    containerStyle: styles.actionCheckbox
                                })}
                            </View>
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
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.padding,
    },
    headerContainer: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: SPACING.smallMargin,
        marginBottom: SPACING.marginBottom,
    },
    headerText: {
        fontSize: FONT_SIZES.header,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    section: {
        marginBottom: SPACING.marginBottom,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.title,
        fontWeight: 'bold',
        marginBottom: SPACING.smallMargin,
    },
    productItem: {
        textAlign: 'center',
        fontSize: FONT_SIZES.normal,
        marginBottom: SPACING.tinyMargin,
    },
    baseCheckbox: {
        backgroundColor: COLORS.transparent,
        borderWidth: 0,
        padding: 0,
        marginLeft: 0,
    },
    checkboxText: {
        fontWeight: 'normal',
        fontSize: FONT_SIZES.normal,
    },
    actionTitle: {
        fontSize: FONT_SIZES.title,
        fontWeight: 'bold',
        marginBottom: SPACING.smallMargin,
    },
    actionCheckbox: {
        marginBottom: SPACING.tinyMargin,
    },
    buttonContainer: {
        padding: SPACING.padding,
        paddingBottom: height * 0.05,
    },
    additionalInfo: {
        fontSize: FONT_SIZES.normal,
        color: COLORS.text,
    },
    tempControl: {
        width: '100%',
        borderRadius: 12,
        height: height * 0.07,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tempControlError: {
        backgroundColor: COLORS.errorBackground,
    }
});

export default TcpEdit;
