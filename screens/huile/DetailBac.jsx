import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CounterInput from "react-native-counter-input";
import PictureModal from "../../components/PictureModal";
import CustomButton from "../../components/CustomButton";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { SelectList } from "react-native-dropdown-select-list";

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
            Alert.alert("Attention", "Aucune photo n'a été ajoutée. Voulez-vous continuer sans photo ?", [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Continuer",
                    onPress: () => submitData()
                }
            ]);
        } else {
            submitData();
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
        <SafeAreaView className="bg-white flex-1 h-full">
            <ScrollView>
                <View className="w-full flex-1 px-4 my-6 h-full flex-col space-y-4">
                    <View style={{ gap: 15 }}>
                        <Text className="font-bold text-lg">Type de contrôle</Text>
                        <SelectList
                            setSelected={(value) => setControlType(value)}
                            data={data}
                            boxStyles={styles.select}
                            save="value"
                            placeholder="Sélectionnez le type de contrôle"
                        />
                    </View>
                    <Text className="font-bold text-lg">Température (°C)</Text>
                    <CounterInput
                        horizontal={true}
                        increaseButtonBackgroundColor="#008170"
                        decreaseButtonBackgroundColor="#008170"
                        className="w-full rounded-xl h-16 border-[1px] border-secondary shadow-none"
                        onChange={(counter) => setTemperature(counter)}
                        min={65}
                        initial={65}
                        value={temperature}
                        reverseCounterButtons
                    />
                    <Text className="font-bold text-lg">Polarité (%)</Text>
                    <CounterInput
                        horizontal={true}
                        increaseButtonBackgroundColor="#008170"
                        decreaseButtonBackgroundColor="#008170"
                        className="w-full rounded-xl h-16 border-[1px] border-secondary shadow-none"
                        onChange={(counter) => setPolarity(counter)}
                        min={0}
                        initial={0}
                        value={polarity}
                        reverseCounterButtons
                    />
                    <View style={{ gap: 15 }}>
                        <Text className="font-bold text-lg">Action corrective ?</Text>
                        <SelectList
                            setSelected={(value) => setCorrectiveAction(value)}
                            data={actionData}
                            boxStyles={styles.select}
                            save="value"
                            placeholder="Sélectionnez le type d'action corrective"
                        />
                    </View>
                    <Text className="font-bold text-lg">Photo de l'étiquette</Text>
                    <View className="items-end">
                        <TouchableOpacity
                            className="p-2 bg-primary rounded-xl items-center flex-row"
                            onPress={uploadImage}
                        >
                            <FontAwesome name="camera" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">
                                {image ? "Changer" : "Ajouter"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {image && (
                        <View className="mt-2">
                            <PictureModal image={image.uri} imageName={image.name} imageSize={image.size} />
                        </View>
                    )}
                </View>
                <View className="w-full px-4 my-8">
                    <CustomButton title="Valider la saisie" handlePress={handleSubmit} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    select: {
        width: "100%",
        paddingVertical: 20,
        borderStyle: "solid",
        borderRadius: 12,
        borderColor: "#C5C6CC",
    }
});

export default DetailBac;