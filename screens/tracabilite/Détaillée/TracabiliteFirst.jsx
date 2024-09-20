import React, {useContext, useEffect, useState} from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import DateTimeField from "../../../components/DateTimeField";
import {Chip, Searchbar} from "react-native-paper";
import {AntDesign} from '@expo/vector-icons';
import axiosConfig from "../../../helpers/axiosConfig";
import CustomButton from "../../../components/CustomButton";
import {AuthContext} from "../../../context/AuthProvider";
import FormField from "../../../components/FormField";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import CheckBox from "expo-checkbox";

const TracabiliteFirst = ({navigation, route}) => {

    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const {user} = useContext(AuthContext);
    const [productName, setProductName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [checkedProducts, setCheckedProducts] = useState({});
    const [selectedService, setSelectedService] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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
        console.log(selectedProducts)
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

    const handleChipClick = (service) => {
        setSelectedService(service);
    };

    const sendAllData = async () => {
        if (selectedProducts.length === 0) {
            Alert.alert(
                "Aucun produit sélectionné",
                "Veuillez sélectionner au moins un produit avant de soumettre.",
                [{ text: "OK" }]
            );
            return;
        }

        setIsLoading(true);

        try {
            // Create FormData object
            const formData = new FormData();

            formData.append('user_id', user.id);
            formData.append('opened_at', new Date().toISOString().slice(0, 19).replace('T', ' '));
            formData.append('service', selectedService);  // Modify this based on actual service data

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
            navigation.navigate('Accueil')
            showToast();
            setIsModalVisible(false);
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleCheckboxChange = (productId, productName) => {
        setCheckedProducts(prevState => {
            const newCheckedProducts = { ...prevState, [productId]: !prevState[productId] };

            // Determine if the checkbox was checked or unchecked
            const wasChecked = prevState[productId];
            const isChecked = !wasChecked;

            if (isChecked) {
                // Navigate to product detail if checked
                navigation.navigate('Détail Produit', { productId, productName });
            } else {
                // Uncheck case: Remove the product from selectedProducts
                setSelectedProducts(prevProducts => {
                    const updatedProducts = prevProducts.filter(product => product.productId !== productId);

                    // Alert and log data when product is removed
                    Alert.alert(
                        "Produit retiré",
                        `Le produit ${productName} a été retiré de la sélection.`,
                        [{ text: "OK" }]
                    );
                    console.log('Updated Selected Products:', updatedProducts);

                    return updatedProducts;
                });
            }

            return newCheckedProducts;
        });
    };


    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


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
                            <Chip
                                className={`rounded-2xl ${selectedService === 'Matin' ? 'bg-[#008170] text-white' : 'bg-[#EAF2FF]'}`}
                                textStyle={{
                                    color: selectedService === 'Matin' ? 'white' : '#008170',
                                    textTransform: "uppercase"
                                }}
                                onPress={() => handleChipClick('Matin')}
                            >
                                Matin
                            </Chip>
                            <Chip
                                className={`rounded-2xl ${selectedService === 'Midi' ? 'bg-[#008170] text-white' : 'bg-[#EAF2FF]'}`}
                                textStyle={{
                                    color: selectedService === 'Midi' ? 'white' : '#008170',
                                    textTransform: "uppercase"
                                }}
                                onPress={() => handleChipClick('Midi')}
                            >
                                Midi
                            </Chip>
                            <Chip
                                className={`rounded-2xl ${selectedService === 'Soir' ? 'bg-[#008170] text-white' : 'bg-[#EAF2FF]'}`}
                                textStyle={{
                                    color: selectedService === 'Soir' ? 'white' : '#008170',
                                    textTransform: "uppercase"
                                }}
                                onPress={() => handleChipClick('Soir')}
                            >
                                Soir
                            </Chip>
                            <Chip
                                className={`rounded-2xl ${selectedService === 'Indifférent' ? 'bg-[#008170] text-white' : 'bg-[#EAF2FF]'}`}
                                textStyle={{
                                    color: selectedService === 'Indifférent' ? 'white' : '#008170',
                                    textTransform: "uppercase"
                                }}
                                onPress={() => handleChipClick('Indifférent')}
                            >
                                Indifférent
                            </Chip>
                        </View>
                    </View>
                    <View style={{gap: 20}}>
                        <Text className="font-bold text-lg">Produits</Text>
                        <View className="w-full items-center space-x-4 flex-row">
                            <Searchbar className="w-4/5 bg-secondary-100" placeholder="Rechercher un produit"
                                       value={searchQuery} onChangeText={handleSearch}/>
                            <TouchableOpacity
                                className="rounded-full w-[45px] h-[45px] justify-center items-center bg-primary"
                                onPress={toggleModal}
                            >
                                <AntDesign name="plus" size={24} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{height: 300}} contentContainerStyle={{gap: 10}}>
                            {filteredProducts.map(product => (
                                <View key={product.id}
                                      className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-4 flex-row">
                                    <View>
                                        <Text className="font-bold text-lg">{product.name}</Text>
                                        <Text>1kg</Text>
                                    </View>
                                    <View>
                                        <CheckBox
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
