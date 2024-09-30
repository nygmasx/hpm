import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, Image } from "react-native";
import { AuthContext } from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const HistoriqueReception = () => {
    const [receptions, setReceptions] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadReceptions = async () => {
            try {
                const data = await fetchReceptions(user.id);
                setReceptions(data);
            } catch (error) {
                console.error('Error loading receptions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadReceptions();
    }, [user.id]);

    const fetchReceptions = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/receptions`);
            const receptions = response.data;

            return receptions.reduce((acc, reception) => {
                const date = new Date(reception.date);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(reception);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error fetching receptions:', error);
            throw error;
        }
    };

    const renderMonthItem = ({ item: month }) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <FlatList
                data={receptions[month]}
                renderItem={renderReceptionItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
            />
        </View>
    );

    const renderReceptionItem = ({ item: reception }) => (
        <View style={styles.receptionContainer}>
            <Text style={styles.receptionReference}>Référence: {reception.reference}</Text>
            <Text style={styles.receptionDate}>Date: {formatDate(reception.date)}</Text>
            <Text style={styles.receptionService}>Service: {reception.service}</Text>
            <Text style={styles.receptionNonCompliance}>Non-conformité: {reception.non_compliance_reason}</Text>
            {reception.non_compliance_picture && (
                <Image
                    source={{ uri: `https://apimobile.testingtest.fr/storage/non_compliance_pictures/${reception.non_compliance_picture}` }}
                    style={styles.nonComplianceImage}
                />
            )}
            {reception.products && reception.products.length > 0 ? (
                <View>
                    <Text style={styles.productsTitle}>Produits:</Text>
                    {reception.products.map(product => (
                        <Text key={product.id} style={styles.productItem}>
                            {product.name} (Quantité: {product.pivot.quantity})
                        </Text>
                    ))}
                </View>
            ) : (
                <Text style={styles.noProducts}>Aucun produit enregistré</Text>
            )}
        </View>
    );

    const formatMonthTitle = (monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <FlatList
                    data={Object.keys(receptions).sort().reverse()}
                    renderItem={renderMonthItem}
                    keyExtractor={(item) => item}
                    scrollEnabled={false}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollViewContent: {
        flexGrow: 1,
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthContainer: {
        marginBottom: 20,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    receptionContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    receptionReference: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    receptionDate: {
        fontSize: 14,
        color: '#666',
    },
    receptionService: {
        fontSize: 14,
    },
    receptionNonCompliance: {
        fontSize: 14,
        color: 'red',
    },
    nonComplianceImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        marginTop: 5,
    },
    productsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },
    productItem: {
        fontSize: 12,
        marginLeft: 10,
    },
    noProducts: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#666',
    },
});

export default HistoriqueReception;