import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import DateTimeField from "../../components/DateTimeField";
import { Chip, Searchbar } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";

const { width, height } = Dimensions.get('window');
const scale = Math.min(width, height) / 375;
const responsiveSize = (size) => size * scale;

const NewProduct = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.mainContent}>
                    <DateTimeField title="Date d'ouverture du/des produit(s)"/>

                    <View style={styles.serviceSection}>
                        <Text style={styles.sectionTitle}>Durant quel service ?</Text>
                        <View style={styles.chipContainer}>
                            {['Matin', 'Midi', 'Soir', 'Indifférent'].map((service) => (
                                <Chip
                                    key={service}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
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
                            />
                            <TouchableOpacity style={styles.addButton}>
                                <AntDesign
                                    name="plus"
                                    size={responsiveSize(24)}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.productList}
                            contentContainerStyle={styles.productListContent}
                        >
                            {products.map(product => (
                                <TouchableOpacity
                                    key={product.id}
                                    onPress={() => {
                                        navigation.navigate('Détail Produit', {productId: product.id})
                                    }}
                                    style={styles.productItem}
                                >
                                    <View>
                                        <Text style={styles.productName}>{product.name}</Text>
                                        <Text style={styles.productWeight}>1kg</Text>
                                    </View>
                                    <View>
                                        <AntDesign
                                            name="checkcircle"
                                            size={responsiveSize(24)}
                                            color="#008170"
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.buttonContainer}>
                            <CustomButton title="Valider la saisie"/>
                        </View>
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
        height: '100%'
    },
    scrollView: {
        height: '100%'
    },
    mainContent: {
        width: '100%',
        flex: 1,
        paddingHorizontal: responsiveSize(16),
        marginVertical: responsiveSize(24),
        gap: responsiveSize(16)
    },
    serviceSection: {
        gap: responsiveSize(16)
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: responsiveSize(18),
        includeFontPadding: false
    },
    chipContainer: {
        flexDirection: 'row',
        gap: responsiveSize(10)
    },
    chip: {
        borderRadius: responsiveSize(16),
        backgroundColor: '#EAF2FF'
    },
    chipText: {
        color: '#008170',
        textTransform: 'uppercase'
    },
    productsSection: {
        gap: responsiveSize(20)
    },
    searchContainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        gap: responsiveSize(16)
    },
    searchBar: {
        width: '80%',
        backgroundColor: '#secondary-100' // Replace with your color
    },
    addButton: {
        borderRadius: responsiveSize(22.5),
        width: responsiveSize(45),
        height: responsiveSize(45),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#primary' // Replace with your color
    },
    productList: {
        height: responsiveSize(400)
    },
    productListContent: {
        gap: responsiveSize(10)
    },
    productItem: {
        backgroundColor: '#secondary-200', // Replace with your color
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: responsiveSize(16),
        padding: responsiveSize(16),
        flexDirection: 'row'
    },
    productName: {
        fontWeight: 'bold',
        fontSize: responsiveSize(18),
        includeFontPadding: false
    },
    productWeight: {
        fontSize: responsiveSize(14),
        includeFontPadding: false
    },
    buttonContainer: {
        width: '100%'
    }
});

export default NewProduct;