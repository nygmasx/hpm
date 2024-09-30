import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions} from "react-native";
import {Searchbar} from "react-native-paper";
import {AntDesign, MaterialCommunityIcons} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";
import CheckBox from "expo-checkbox";
import FormField from "../../components/FormField";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import CustomCounter from "../../components/CustomCounter";

const {width, height} = Dimensions.get('window');

const ReceptionProduit = ({navigation, route}) => {
    const [firstFormData, setFirstFormData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [productName, setProductName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false)
    const {user} = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [checkedProducts, setCheckedProducts] = useState([]);

    useEffect(() => {
        if (route.params?.formData) {
            setFirstFormData(prev => [...prev, route.params.formData]);
            console.log(firstFormData);
        }
        fetchUserProducts();
    }, [route.params]);

    const fetchUserProducts = useCallback(async () => {
        axiosConfig.get(`/user/${user.id}/products`, {})
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [user.id, user.token]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredProducts = useMemo(() =>
            products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [products, searchQuery]);

    const sendProductData = useCallback(async () => {
        if (!productName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Veuillez entrer un nom de produit',
            });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', productName.trim());

        try {
            await axiosConfig.post('/product/new', formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            await fetchUserProducts();
            setIsModalVisible(false);
            setProductName('');
            Toast.show({
                type: 'success',
                text1: 'Produit ajouté 🟢',
            });
        } catch (error) {
            console.error('Error adding product:', error);
            Toast.show({
                type: 'error',
                text1: "Erreur lors de l'ajout du produit",
            });
        } finally {
            setIsLoading(false);
        }
    }, [productName, user.token, fetchUserProducts]);

    const toggleModal = useCallback(() => {
        setIsModalVisible(prev => !prev);
    }, []);

    const handleCheck = useCallback((id) => {
        setProducts(prevProducts => {
            return prevProducts.map(item => {
                if (item.id === id) {
                    const checked = !item.checked;
                    if (checked) {
                        setCheckedProducts(prev => [...prev, {product_id: id}]);
                        console.log('Added product:', {product_id: id});
                    } else {
                        setCheckedProducts(prev => prev.filter(product => product.product_id !== id));
                        console.log('Removed product:', {product_id: id});
                    }

                    return {...item, checked};
                }
                return item;
            });
        });
    }, []);

    const handleQuantityChange = (id, newQuantity) => {
        setProducts(prevProducts =>
            prevProducts.map(item =>
                item.id === id ? {...item, quantity: newQuantity} : item
            )
        );

        setCheckedProducts(prev =>
            prev.map(product =>
                product.id === id ? {...product, quantity: newQuantity} : product
            )
        );

        // Log the degree change in real-time
        console.log(`Equipment ID: ${id}, New Degree: ${newQuantity}`);
    };

    const handleSubmit = useCallback(() => {
        // Validate that at least one product is selected
        const selectedProducts = products.filter(product => product.checked);
        if (selectedProducts.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Veuillez sélectionner au moins un produit',
            });
            return;
        }

        const invalidProducts = selectedProducts.filter(product => !product.quantity || product.quantity <= 0);
        if (invalidProducts.length > 0) {
            Toast.show({
                type: 'error',
                text1: 'Veuillez spécifier une quantité pour tous les produits sélectionnés',
            });
            return;
        }

        const productData = selectedProducts.map(product => ({
            id: product.id,
            name: product.name,
            quantity: product.quantity
        }));

        const combinedFormData = {
            ...firstFormData[0],
            products: productData
        };

        navigation.navigate('Reception Final', { formData: combinedFormData });
    }, [products, firstFormData, navigation]);


    const renderProductItem = useCallback(({item}) => (
        <View key={item.id} style={styles.productItem}>
            <View>
                <Text style={styles.productName}>{item.name}</Text>
                <Text>1kg</Text>
            </View>
            <View style={styles.productActions}>
                {!item.checked && (
                    <CheckBox
                        value={item.checked}
                        onValueChange={() => handleCheck(item.id)}
                        color="#008170"
                        style={styles.checkbox}
                    />
                )}
                {item.checked && (
                    <CustomCounter
                        value={item.quantity}
                        handleChange={(newQuantity => handleQuantityChange(item.id, newQuantity))}
                    />
                )}
            </View>
        </View>
    ), [handleCheck]);


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
            <View style={styles.content}>
                <Text style={styles.title}>Produits réceptionnés</Text>
                <View style={styles.productsSection}>
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
                    <ScrollView
                        style={styles.productList}
                        contentContainerStyle={styles.productListContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredProducts.map(item => renderProductItem({item}))}
                    </ScrollView>
                </View>
            </View>
            <View style={styles.bottomButtonContainer}>
                <CustomButton
                    title="Valider la saisie"
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
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        paddingHorizontal: width * 0.04,
        paddingTop: height * 0.02,
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
    title: {
        fontWeight: 'bold',
        fontSize: width * 0.06,
        marginBottom: height * 0.02,
        color: '#333',
    },
    productsSection: {
        flex: 1,
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
        flex: 1,
    },
    productListContent: {
        paddingBottom: height * 0.15, // Increased padding at the bottom
        gap: 10
    },
    productItem: {
        backgroundColor: '#F5F5F5',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        padding: width * 0.04,
        marginBottom: 10,
    },
    productName: {
        fontWeight: '700',
        fontSize: width * 0.045,
        color: '#333',
        marginBottom: 4,
    },
    productQuantity: {
        fontSize: width * 0.035,
        color: '#666',
    },
    productActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    checkbox: {
        borderRadius: 12.5,
        width: 25,
        height: 25,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: height * 0.03,
        left: width * 0.04,
        right: width * 0.04,
    },
});

export default ReceptionProduit;