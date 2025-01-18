import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Dimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CounterInput from "react-native-counter-input";
import PictureModal from "../../components/PictureModal";
import CustomButton from "../../components/CustomButton";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { SelectList } from "react-native-dropdown-select-list";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const DetailBac = ({ navigation }) => {
    const [controlType, setControlType] = useState('');
    const [correctiveAction, setCorrectiveAction] = useState('');
    const [temperature, setTemperature] = useState(65);
    const [polarity, setPolarity] = useState(0);
    const [image, setImage] = useState(null);
    const route = useRoute();
    const { oilTrayName, oilTrayId } = route.params;

    useEffect(() => {
        navigation.setOptions({ title: oilTrayName });
    }, [navigation, oilTrayName]);

    const uploadImage = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                const name = imageUri.split('/').pop();
                const type = result.assets[0].type || 'image/jpeg';
                const info = await FileSystem.getInfoAsync(imageUri);
                const sizeInMB = (info.size / (1024 * 1024)).toFixed(2) + ' MB';

                setImage({ uri: imageUri, name, size: sizeInMB, type });
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Erreur", "Une erreur s'est produite lors de la capture de l'image.");
        }
    };

    const handleSubmit = async () => {
        if (!controlType) {
            Alert.alert("Erreur", "Veuillez sélectionner un type de contrôle.");
            return;
        }

        if (temperature < 65) {
            Alert.alert("Erreur", "La température doit être d'au moins 65°C.");
            return;
        }

        if (polarity < 0) {
            Alert.alert("Erreur", "La polarité ne peut pas être négative.");
            return;
        }

        if (!correctiveAction) {
            Alert.alert("Erreur", "Veuillez sélectionner une action corrective.");
            return;
        }

        if (!image) {
            Alert.alert("Attention", "Veuillez ajouter une image.", [
                {
                    text: "Annuler",
                    style: "cancel"
                },
            ]);
        }
    };

    const submitData = () => {
        const oilTrayData = {
            oilTrayId,
            oilTrayName,
            controlType,
            correctiveAction,
            temperature,
            polarity,
            image: image ? { uri: image.uri, name: image.name, type: image.type } : null
        };
        console.log(oilTrayData);
        navigation.navigate('Huile', { oilTrayData });
    };

    const data = [
        { key: '1', value: 'Languette' },
        { key: '2', value: 'Test olfactif' },
        { key: '3', value: 'Sonde' },
        { key: '4', value: 'Test visuel' },
        { key: '5', value: 'Test languette + visuel' },
    ];

    const actionData = [
        { key: '1', value: 'Changement d\'huile' },
        { key: '2', value: 'Filtration' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.contentContainer}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Type de contrôle</Text>
                        <SelectList
                            setSelected={(value) => setControlType(value)}
                            data={data}
                            boxStyles={styles.select}
                            save="value"
                            placeholder="Sélectionnez le type de contrôle"
                        />
                    </View>
                    <Text style={styles.sectionTitle}>Température (°C)</Text>
                    <CounterInput
                        horizontal={true}
                        increaseButtonBackgroundColor="#008170"
                        decreaseButtonBackgroundColor="#008170"
                        style={styles.counterInput}
                        onChange={(counter) => setTemperature(counter)}
                        min={65}
                        initial={65}
                        value={temperature}
                        reverseCounterButtons
                    />
                    <Text style={styles.sectionTitle}>Polarité (%)</Text>
                    <CounterInput
                        horizontal={true}
                        increaseButtonBackgroundColor="#008170"
                        decreaseButtonBackgroundColor="#008170"
                        style={styles.counterInput}
                        onChange={(counter) => setPolarity(counter)}
                        min={0}
                        initial={0}
                        value={polarity}
                        reverseCounterButtons
                    />
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Action corrective ?</Text>
                        <SelectList
                            setSelected={(value) => setCorrectiveAction(value)}
                            data={actionData}
                            boxStyles={styles.select}
                            save="value"
                            placeholder="Sélectionnez le type d'action corrective"
                        />
                    </View>
                    <Text style={styles.sectionTitle}>Photo de l'étiquette</Text>
                    <View style={styles.cameraButtonContainer}>
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={uploadImage}
                        >
                            <FontAwesome name="camera" size={20} color="white" />
                            <Text style={styles.cameraButtonText}>
                                {image ? "Changer" : "Ajouter"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {image && (
                        <View style={styles.imagePreview}>
                            <PictureModal image={image.uri} imageName={image.name} imageSize={image.size} />
                        </View>
                    )}
                </View>
                <View style={styles.submitButtonContainer}>
                    <CustomButton title="Valider la saisie" handlePress={handleSubmit} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        height: windowHeight,
    },
    contentContainer: {
        width: '100%',
        flex: 1,
        paddingHorizontal: windowWidth * 0.04,
        marginVertical: windowHeight * 0.02,
        height: '100%',
    },
    section: {
        gap: windowHeight * 0.02,
        marginBottom: windowHeight * 0.02,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: Math.min(windowWidth * 0.045, 18),
        marginBottom: windowHeight * 0.01,
    },
    select: {
        width: '100%',
        paddingVertical: windowHeight * 0.025,
        borderStyle: 'solid',
        borderRadius: 12,
        borderColor: '#C5C6CC',
    },
    counterInput: {
        width: '100%',
        borderRadius: 12,
        height: windowHeight * 0.07,
        borderWidth: 1,
        borderColor: '#C5C6CC',
        marginBottom: windowHeight * 0.02,
    },
    cameraButtonContainer: {
        alignItems: 'flex-end',
        marginBottom: windowHeight * 0.02,
    },
    cameraButton: {
        padding: windowWidth * 0.02,
        backgroundColor: '#008170',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cameraButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: windowWidth * 0.02,
    },
    imagePreview: {
        marginTop: windowHeight * 0.01,
    },
    submitButtonContainer: {
        width: '100%',
        paddingHorizontal: windowWidth * 0.04,
        marginVertical: windowHeight * 0.03,
    },
});

export default DetailBac;