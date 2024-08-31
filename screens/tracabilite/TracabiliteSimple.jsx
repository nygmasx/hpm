import React, {useContext, useState} from "react";
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import FormField from "../../components/FormField";
import DateTimeField from "../../components/DateTimeField";
import {FontAwesome} from '@expo/vector-icons';
import CustomButton from "../../components/CustomButton";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import PictureModal from "../../components/PictureModal";
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";
import Toast from "react-native-toast-message";

const TracabiliteSimple = ({navigation}) => {
    const [images, setImages] = useState([]);
    const [openedAt, setOpenedAt] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const {user} = useContext(AuthContext);

    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: 'Traçabilité confirmé 🟢',
            text2: 'This is some something 👋'
        });
    }

    const sendData = async () => {
        setIsLoading(true);

        const formData = new FormData();
        const formattedOpenedAt = openedAt.toISOString().slice(0, 19).replace('T', ' ');

        formData.append('opened_at', formattedOpenedAt);

        images.forEach((image, index) => {
            console.log(`Image ${index}:`);
            console.log('URI:', image.uri);
            console.log('Name:', image.name);
            console.log('Type:', image.type);
            formData.append(`simple_label_pictures[${index}]`, {
                uri: image.uri,
                type: image.type,  // Adjusted to include image type
                name: image.name,
            });
        });

        console.log(formData)
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
                const type = result.assets[0].type || 'image/jpeg';  // Adjusted to dynamically set the image type
                const info = await FileSystem.getInfoAsync(imageUri);
                const sizeInMB = (info.size / (1024 * 1024)).toFixed(2) + ' MB';

                setImages([...images, {uri: imageUri, name, size: sizeInMB, type}]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <ScrollView style={{height: "100%"}}>
                <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col" style={{gap: 20}}>
                    <DateTimeField title="Date d’ouverture du/des produit(s)"/>
                    <View style={{gap: 20}}>
                        <Text className="font-bold text-lg">Photos de l'étiquette</Text>
                        <View className="items-end">
                            <TouchableOpacity className="p-2 bg-primary rounded-xl items-center flex-row"
                                              onPress={uploadImage}>
                                <FontAwesome name="camera" size={20} color="white"/>
                                <Text className="text-white font-bold ml-2">Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="mt-2">
                            {images.map((image, index) => (
                                <PictureModal key={index} image={image.uri} imageName={image.name}
                                              imageSize={image.size}/>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie" handlePress={sendData} isLoading={isLoading}/>
            </View>
        </SafeAreaView>
    );
};

export default TracabiliteSimple;
