import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Dimensions} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {FontAwesome, Ionicons} from "@expo/vector-icons";
import CounterInput from "react-native-counter-input";
import PictureModal from "../../../components/PictureModal";
import CustomButton from "../../../components/CustomButton";
import {useRoute} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const DetailProduit = ({navigation}) => {
    const [dlc, setDlc] = useState(new Date());
    const [quantity, setQuantity] = useState(0);
    const [images, setImages] = useState([]);
    const route = useRoute();
    const { productName, productId } = route.params;

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
        const productData= {
            productId,
            productName,
            dlc: dlc.toISOString().replace('T', ' ').slice(0, 19),
            quantity,
            images: images.map(image => ({ uri: image.uri, name: image.name, type: image.type }))
        };
        console.log(productData)
        navigation.navigate('Tracabilite Détaillée', { productData });
    };

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6 h-full flex-col space-y-4">
                <Text className="font-bold text-lg">Date limite de consommation</Text>
                <View className="border-[1px] flex space-x-2 border-secondary w-4/7 h-16 px-4 rounded-[12px] focus:border-primary justify-center items-center flex-row">
                    <RNDateTimePicker className="text-center" mode="date" value={dlc} display="compact"/>
                    <Ionicons className="right-0" name="calendar-clear" size={24} color="#008170"/>
                </View>
                <Text className="font-bold text-lg">Quantité consommée</Text>
                <CounterInput
                    horizontal={true}
                    increaseButtonBackgroundColor="#008170"
                    decreaseButtonBackgroundColor="#008170"
                    className="w-full rounded-xl h-16 border-[1px] border-secondary shadow-none"
                    min="0"
                    value={quantity}
                    onChange={(counter) => setQuantity(counter)}
                    reverseCounterButtons
                />
                <Text className="font-bold text-lg">Photos de l'étiquette</Text>
                <View className="items-end">
                    <TouchableOpacity className="p-2 bg-primary rounded-xl items-center flex-row" onPress={uploadImage}>
                        <FontAwesome name="camera" size="20" color="white"/>
                        <Text className="text-white font-bold ml-2">Ajouter</Text>
                    </TouchableOpacity>
                </View>
                <View className="mt-2">
                    {images.map((image, index) => (
                        <PictureModal key={index} image={image.uri} imageName={image.name} imageSize={image.size}/>
                    ))}
                </View>
            </View>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie" handlePress={handleSubmit} />
            </View>
        </SafeAreaView>
    );
};

export default DetailProduit;
