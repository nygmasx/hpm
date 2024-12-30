import React, { useContext, useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Dimensions } from "react-native";
import { Searchbar } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import { SelectList } from "react-native-dropdown-select-list";
import FormField from "../../components/FormField";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";
import CheckBox from "expo-checkbox";
import Toast from "react-native-toast-message";
import Modal from "react-native-modal";

const { width, height } = Dimensions.get('window');

const TcProduit = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { user } = useContext(AuthContext);
    const [checkedProducts, setCheckedProducts] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [additionalInfo, setAdditionalInfo] = useState('');

    const data = [
        { key: '1', value: 'Liaison chaude' },
        { key: '2', value: 'Liaison froide' },
        { key: '3', value: 'Refroidissement' },
        { key: '4', value: 'Remise en T°C' },
        { key: '5', value: 'Température service chaud' },
    ];

    useEffect(() => {
        fetchUserProducts();
    }, []);

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const fetchUserProducts = async () => {
        setIsLoading(true);
        try {
            const response = await axiosConfig.get(`/user/${user.id}/products`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            Alert.alert("Erreur", "Impossible de récupérer les produits.");
        } finally {
            setIsLoading(false);
        }
    };

    const sendProductData = async () => {
        setIsLoading(true)
        const formData = new FormData();
        formData.append('name', productName)

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/product/new', formData);
            await fetchUserProducts()
            setIsModalVisible(!isModalVisible)
            setProductName('')
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

    const handleCheckboxChange = (productId, productName) => {
        setCheckedProducts(prevState => {
            const newCheckedProducts = { ...prevState, [productId]: !prevState[productId] };
            return newCheckedProducts;
        });

        setSelectedProducts(prevProducts => {
            if (prevProducts.some(p => p.productId === productId)) {
                return prevProducts.filter(p => p.productId !== productId);
            } else {
                return [...prevProducts, { productId, productName }];
            }
        });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = () => {
        if (selectedProducts.length === 0) {
            Alert.alert("Erreur", "Veuillez sélectionner au moins un produit.");
            return;
        }

        if (!selectedOperation) {
            Alert.alert("Erreur", "Veuillez sélectionner un type d'opération.");
            return;
        }

        navigation.navigate('TcpOperation', {
            selectedProducts,
            operationType: selectedOperation,
            additionalInfo
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Modal isVisible={isModalVisible}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Ajouter un produit</Text>
                        <View style={styles.formField}>
                            <FormField title="Nom du produit" value={productName} handleChangeText={setProductName} />
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
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Type d'opération</Text>
                        <SelectList
                            setSelected={(val) => setSelectedOperation(val)}
                            data={data}
                            save="value"
                            boxStyles={styles.select}
                            placeholder="Sélectionner une opération"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Produits réceptionnés</Text>
                        <View style={styles.searchContainer}>
                            <Searchbar
                                style={styles.searchBar}
                                placeholder="Rechercher un produit"
                                onChangeText={handleSearch}
                                value={searchQuery}
                            />
                            <TouchableOpacity onPress={toggleModal} style={styles.addButton}>
                                <AntDesign name="plus" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.productList}>
                            {filteredProducts.map(product => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={styles.productItem}
                                    onPress={() => handleCheckboxChange(product.id, product.name)}
                                >
                                    <View>
                                        <Text style={styles.productName}>{product.name}</Text>
                                        <Text style={styles.productQuantity}>1kg</Text>
                                    </View>
                                    <CheckBox
                                        value={!!checkedProducts[product.id]}
                                        onValueChange={() => handleCheckboxChange(product.id, product.name)}
                                        color="#008170"
                                        style={styles.checkbox}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <FormField
                        title="Informations complémentaires"
                        value={additionalInfo}
                        handleChangeText={setAdditionalInfo}
                    />
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: width * 0.04,
    },
    section: {
        marginBottom: height * 0.03,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: width * 0.045,
        marginBottom: height * 0.01,
    },
    select: {
        width: "100%",
        paddingVertical: height * 0.025,
        borderStyle: "solid",
        borderRadius: 12,
        borderColor: "#C5C6CC",
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
        maxHeight: height * 0.3,
    },
    productItem: {
        backgroundColor: '#F5F5F5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        padding: width * 0.04,
        marginBottom: height * 0.01,
    },
    productName: {
        fontWeight: 'bold',
        fontSize: width * 0.04,
    },
    productQuantity: {
        fontSize: width * 0.035,
        color: '#71727A',
    },
    checkbox: {
        borderRadius: 12.5,
        width: 25,
        height: 25,
    },
    buttonContainer: {
        padding: width * 0.04,
        paddingBottom: height * 0.05,
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
});

export default TcProduit;