import React, {useContext, useEffect, useState} from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import DateTimeField from "../../../components/DateTimeField";
import {Chip, Searchbar} from "react-native-paper";
import {AntDesign, FontAwesome6} from '@expo/vector-icons';
import axios from "axios";
import CustomButton from "../../../components/CustomButton";
import {AuthContext} from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";
import FormField from "../../../components/FormField";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import CheckBox from "expo-checkbox";

const TracabiliteFirst = ({navigation, route}) => {

    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const {user} = useContext(AuthContext);
    const [productName, setProductName] = useState(productName)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [checkedProducts, setCheckedProducts] = useState({});

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: 'Traçabilité confirmé 🟢',
            text2: 'This is some something 👋'
        });
    }

    useEffect(() => {
        if (route.params?.productData) {
            setSelectedProducts(prev => [...prev, route.params.productData]);
        }
        fetchUserProducts();
    }, [route.params]);

    const fetchUserProducts = async () => {
        axiosConfig.get(`/user/${user.id}/products`, {})
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    const sendProductData = async () => {
        setIsLoading(true)
        const formData = new FormData();
        formData.append('name', productName)

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/product/new', formData);
            await fetchUserProducts()
            setIsModalVisible(!isModalVisible)
            showToast()
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const sendAllData = async () => {
        setIsLoading(true);

        try {
            // Create FormData object
            const formData = new FormData();

            // Append basic fields to the FormData (user_id, opened_at, service)
            formData.append('user_id', user.id);
            formData.append('opened_at', new Date().toISOString().slice(0, 19).replace('T', ' '));
            formData.append('service', 'Matin');  // Modify this based on actual service data

            // Append each product's data as separate fields in the FormData
            selectedProducts.forEach((product, productIndex) => {
                formData.append(`products[${productIndex}][product_id]`, product.productId);
                formData.append(`products[${productIndex}][expiration_date]`, product.dlc);
                formData.append(`products[${productIndex}][quantity]`, product.quantity);

                // Append each product's images
                product.images.forEach((image, imageIndex) => {
                    formData.append(`products[${productIndex}][label_pictures][${imageIndex}]`, {
                        uri: image.uri,
                        name: image.name,
                        type: 'image/jpeg', // or adjust according to image type
                    });
                });
            });
            // Send the request with the FormData
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            const response = await axiosConfig.post('/advanced-tracability/new', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log(response.data.message);
            showToast();
            setIsModalVisible(false);
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleCheckboxChange = (productId, productName) => {
        setCheckedProducts(prevState => ({
            ...prevState,
            [productId]: !prevState[productId]
        }));

        // Navigate if the checkbox is checked
        if (!checkedProducts[productId]) {
            navigation.navigate('Détail Produit', {productId, productName});
        }
    }


    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <Modal isVisible={isModalVisible}>
                <View className="p-6 space-y-8 bg-white items-center rounded-2xl justify-between">
                    <View className="w-full" style={{gap: 20}}>
                        <Text className="text-xl text-center font-extrabold">Ajouter un produit</Text>
                        <View className="space-y-4">
                            <FormField title="Nom de l'équipement" value={productName}
                                       handleChangeText={setProductName}/>
                        </View>
                    </View>
                    <View className="flex-row space-x-2 items-end">
                        <TouchableOpacity
                            className="border-primary justify-center border-2 h-14 items-center w-1/2 rounded-2xl"
                            onPress={toggleModal}
                        >
                            <Text className="text-primary text-[16px] font-semibold">Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl"
                                          onPress={sendProductData}
                        >
                            <Text className="text-white text-[16px] font-semibold">Confirmer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ScrollView style={{height: "100%"}}>
                <View className="w-full flex-1 px-4 my-6 justify-between flex-col space-y-4">
                    <DateTimeField title="Date d’ouverture du/des produit(s)"/>
                    <View className="space-y-4">
                        <Text className="font-bold text-lg">Durant quel service ?</Text>
                        <View className="flex-row" style={{gap: 10}}>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Matin</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Midi</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Soir</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Indifférent</Chip>
                        </View>
                    </View>
                    <View style={{gap: 20}}>
                        <Text className="font-bold text-lg">Produits</Text>
                        <View className="w-full items-center space-x-4 flex-row">
                            <Searchbar className="w-4/5 bg-secondary-100" placeholder="Rechercher un produit"/>
                            <TouchableOpacity
                                className="rounded-full w-[45px] h-[45px] justify-center items-center bg-primary"
                                onPress={toggleModal}
                            >
                                <AntDesign name="plus" size={24} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{height: 400}} contentContainerStyle={{gap: 10}}>
                            {products.map(product => (
                                <View
                                    key={product.id}

                                    className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-4 flex-row">
                                    <View>
                                        <Text className="font-bold text-lg">{product.name}</Text>
                                        <Text>1kg</Text>
                                    </View>
                                    <View className="">
                                        <CheckBox
                                            disabled={false}
                                            value={!!checkedProducts[product.id]}
                                            onValueChange={() => handleCheckboxChange(product.id, product.name)}
                                            color="#008170"
                                            className="rounded-full w-[25px] h-[25px]"
                                        />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        <View>
                            <CustomButton title="Valider la saisie" handlePress={sendAllData} isLoading={isLoading}/>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TracabiliteFirst;
