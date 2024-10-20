import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Dimensions, ScrollView} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {FontAwesome, Ionicons} from "@expo/vector-icons";
import CounterInput from "react-native-counter-input";
import PictureModal from "../../../components/PictureModal";
import CustomButton from "../../../components/CustomButton";
import {useRoute} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import DateTimeField from "../../../components/DateTimeField";

const {width, height} = Dimensions.get('window');

const DetailProduit = ({navigation}) => {
    const [dlc, setDlc] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [images, setImages] = useState([]);
    const route = useRoute();
    const {productName, productId} = route.params;

    useEffect(() => {
        navigation.setOptions({title: productName});
    }, [navigation, productName]);

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

                setImages([...images, {uri: imageUri, name, size: sizeInMB, type}]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async () => {
        const productData = {
            productId,
            productName,
            dlc: dlc,
            quantity,
            images: images.map(image => ({uri: image.uri, name: image.name, type: image.type}))
        };
        console.log(productData);
        navigation.navigate('Tracabilite Détaillée', {productData});
    };

    const handleDateTimeChange = (dateTime) => {
        console.log('DateTime changed:', dateTime);
        setDlc(dateTime);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View>
                        <DateTimeField onChange={handleDateTimeChange} title="Date limite de consommation"/>
                    </View>
                    <Text style={styles.sectionTitle}>Quantité consommée</Text>
                    <CounterInput
                        horizontal={true}
                        increaseButtonBackgroundColor="#008170"
                        decreaseButtonBackgroundColor="#008170"
                        style={styles.counterInput}
                        min={5}
                        value={quantity}
                        onChange={(counter) => setQuantity(counter)}
                        reverseCounterButtons
                    />
                    <Text style={styles.sectionTitle}>Photos de l'étiquette</Text>
                    <View style={styles.addPhotoContainer}>
                        <TouchableOpacity style={styles.addPhotoButton} onPress={uploadImage}>
                            <FontAwesome name="camera" size={20} color="white"/>
                            <Text style={styles.addPhotoText}>Ajouter</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.imagesList}>
                        {images.map((image, index) => (
                            <PictureModal key={index} image={image.uri} imageName={image.name} imageSize={image.size}/>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <CustomButton title="Valider la saisie" handlePress={handleSubmit}/>
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
        gap: height * 0.02, // Added gap between main content sections
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: width * 0.045,
    },
    datePickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        width: width * 0.57,
        height: height * 0.07,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width * 0.02,
    },
    datePicker: {
        width: '80%',
    },
    counterInput: {
        width: '100%',
        borderRadius: 12,
        height: height * 0.07,
        borderWidth: 1,
        borderColor: '#E5E5E5',
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
        gap: width * 0.02, // Added gap between icon and text
    },
    addPhotoText: {
        color: 'white',
        fontWeight: 'bold',
    },
    imagesList: {
        gap: height * 0.01, // Added gap between images
    },
    buttonContainer: {
        position: 'absolute',
        bottom: height * 0.05,
        left: width * 0.04,
        right: width * 0.04,
    },
});

export default DetailProduit;