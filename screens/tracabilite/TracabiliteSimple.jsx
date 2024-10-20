import React, { useContext, useState } from "react";
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import FormField from "../../components/FormField";
import DateTimeField from "../../components/DateTimeField";
import { FontAwesome } from '@expo/vector-icons';
import CustomButton from "../../components/CustomButton";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import PictureModal from "../../components/PictureModal";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get('window');

const TracabiliteSimple = ({ navigation }) => {
    const [images, setImages] = useState([]);
    const [openedAt, setOpenedAt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: 'Traçabilité confirmé 🟢',
            text2: 'This is some something 👋'
        });
    }

    const sendData = async () => {
        if (images.length === 0) {
            Alert.alert(
                "Aucun produit photographié",
                "Veuillez sélectionner au moins un produit avant de soumettre.",
                [{ text: "OK" }]
            );
            return;
        }

        setIsLoading(true);

        const formData = new FormData();

        formData.append('opened_at', openedAt);

        images.forEach((image, index) => {
            formData.append(`simple_label_pictures[${index}]`, {
                uri: image.uri,
                type: image.type,
                name: image.name,
            });
        });

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/simple-tracking', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigation.navigate('Accueil');
            showToast()
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const uploadImage = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
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

                setImages([...images, {uri: imageUri, name, size: sizeInMB, type}]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDateTimeChange = (dateTime) => {
        console.log('DateTime changed:', dateTime);
        setOpenedAt(dateTime);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <DateTimeField onChange={handleDateTimeChange} title="Date d'ouverture du/des produit(s)" />
                    <View style={styles.imageSection}>
                        <Text style={styles.sectionTitle}>Photos de l'étiquette</Text>
                        <View style={styles.addPhotoContainer}>
                            <TouchableOpacity style={styles.addPhotoButton} onPress={uploadImage}>
                                <FontAwesome name="camera" size={20} color="white" />
                                <Text style={styles.addPhotoText}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.imageList}>
                            {images.map((image, index) => (
                                <PictureModal key={index} image={image.uri} imageName={image.name} imageSize={image.size} />
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <CustomButton title="Valider la saisie" handlePress={sendData} isLoading={isLoading} />
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
        gap: height * 0.025,
    },
    imageSection: {
        gap: height * 0.02,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: width * 0.045,
    },
    addPhotoContainer: {
        alignItems: 'flex-end',
    },
    addPhotoButton: {
        padding: width * 0.02,
        backgroundColor: '#008170',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addPhotoText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: width * 0.02,
    },
    imageList: {
        marginTop: height * 0.01,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: height * 0.05,
        left: width * 0.04,
        right: width * 0.04,
    },
});

export default TracabiliteSimple;