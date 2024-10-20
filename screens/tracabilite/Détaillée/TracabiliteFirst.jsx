import React, {useContext, useEffect, useState} from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Dimensions
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

const {width, height} = Dimensions.get('window');

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
    const [dateTime, setDateTime] = useState('')

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
            Toast.show({
                type: 'success',
                text1: 'Produit ajouté 🟢',
            });
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
                [{text: "OK"}]
            );
            return;
        }

        setIsLoading(true);

        try {
            // Create FormData object
            const formData = new FormData();

            formData.append('user_id', user.id);
            formData.append('opened_at', dateTime);
            formData.append('service', selectedService);

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
            const newCheckedProducts = {...prevState, [productId]: !prevState[productId]};

            // Determine if the checkbox was checked or unchecked
            const wasChecked = prevState[productId];
            const isChecked = !wasChecked;

            if (isChecked) {
                // Navigate to product detail if checked
                navigation.navigate('Détail Produit', {productId, productName});
            } else {
                // Uncheck case: Remove the product from selectedProducts
                setSelectedProducts(prevProducts => {
                    const updatedProducts = prevProducts.filter(product => product.productId !== productId);

                    // Alert and log data when product is removed
                    Alert.alert(
                        "Produit retiré",
                        `Le produit ${productName} a été retiré de la sélection.`,
                        [{text: "OK"}]
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

    const handleDateTimeChange = (dateTime) => {
        console.log('DateTime changed:', dateTime);
        setDateTime(dateTime);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Modal isVisible={isModalVisible}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Ajouter un produit</Text>
                        <View style={styles.formField}>
                            <FormField title="Nom de l'équipement" value={productName}
                                       handleChangeText={setProductName}/>
                        </View>
                    </View>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={sendProductData}>
                            <Text style={styles.confirmButtonText}>Confirmer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <DateTimeField onChange={handleDateTimeChange} title="Date d'ouverture du/des produit(s)"/>
                    <View style={styles.serviceSection}>
                        <Text style={styles.sectionTitle}>Durant quel service ?</Text>
                        <View style={styles.chipContainer}>
                            {['Matin', 'Midi', 'Soir', 'Indifférent'].map((service) => (
                                <Chip
                                    key={service}
                                    style={[
                                        styles.chip,
                                        selectedService === service && styles.selectedChip
                                    ]}
                                    textStyle={[
                                        styles.chipText,
                                        selectedService === service && styles.selectedChipText
                                    ]}
                                    onPress={() => handleChipClick(service)}
                                >
                                    {service}
                                </Chip>
                            ))}
                        </View>
                    </View>
                    <View style={styles.productsSection}>
                        <Text style={styles.sectionTitle}>Produits</Text>
                        <View style={styles.searchContainer}>
                            <Searchbar
                                style={styles.searchBar}
                                placeholder="Rechercher un produit"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
                                <AntDesign name="plus" size={24} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.productList} contentContainerStyle={styles.productListContent}>
                            {filteredProducts.map(product => (
                                <View key={product.id} style={styles.productItem}>
                                    <View>
                                        <Text style={styles.productName}>{product.name}</Text>
                                        <Text>1kg</Text>
                                    </View>
                                    <CheckBox
                                        value={!!checkedProducts[product.id]}
                                        onValueChange={() => handleCheckboxChange(product.id, product.name)}
                                        color="#008170"
                                        style={styles.checkbox}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        <CustomButton title="Valider la saisie" handlePress={sendAllData} isLoading={isLoading}/>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollView: {
        height: '100%',
    },
    content: {
        flex: 1,
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.03,
        justifyContent: 'space-between',
    },
    modalContent: {
        padding: width * 0.06,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalHeader: {
        width: '100%',
        marginBottom: height * 0.04,
    },
    modalTitle: {
        fontSize: width * 0.05,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: height * 0.02,
    },
    formField: {
        marginTop: height * 0.02,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        borderColor: '#008170',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.06,
        width: '48%',
        borderRadius: 16,
    },
    cancelButtonText: {
        color: '#008170',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#008170',
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.06,
        width: '48%',
        borderRadius: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    serviceSection: {
        marginVertical: height * 0.02,
    },
    sectionTitle: {
        fontWeight: '700',
        fontSize: width * 0.045,
        marginBottom: height * 0.015,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: width * 0.02,
    },
    chip: {
        borderRadius: 16,
        backgroundColor: '#EAF2FF',
    },
    selectedChip: {
        backgroundColor: '#008170',
    },
    chipText: {
        color: '#008170',
        textTransform: 'uppercase',
    },
    selectedChipText: {
        color: 'white',
    },
    productsSection: {
        marginTop: height * 0.03,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.02,
    },
    searchBar: {
        flex: 1,
        marginRight: width * 0.02,
        backgroundColor: '#F5F5F5',
    },
    addButton: {
        borderRadius: 22.5,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#008170',
    },
    productList: {
        height: height * 0.35,
    },
    productListContent: {
        gap: height * 0.015,
    },
    productItem: {
        backgroundColor: '#F5F5F5',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        padding: width * 0.04,
    },
    productName: {
        fontWeight: '700',
        fontSize: width * 0.045,
    },
    checkbox: {
        borderRadius: 12.5,
        width: 25,
        height: 25,
    },
});

export default TracabiliteFirst;