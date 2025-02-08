import React, { useContext, useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Image,
    Dimensions
} from "react-native";
import { AuthContext } from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const { width, height } = Dimensions.get('window');

const HistoriqueReception = () => {
    const [receptions, setReceptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadReceptions = async () => {
            try {
                const data = await fetchReceptions(user.id);
                setReceptions(data);
            } catch (error) {
                console.error('Error loading receptions:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadReceptions();
    }, [user.id]);

    const fetchReceptions = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/receptions`);
            console.log('API Response:', response.data);

            if (!Array.isArray(response.data)) {
                throw new Error('API did not return an array of receptions');
            }

            return response.data.reduce((acc, reception) => {
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

    const DetailItem = ({ label, value, color }) => (
        <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{label}:</Text>
            <Text style={[styles.detailValue, color && { color }]}>{value}</Text>
        </View>
    );

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
            <View style={styles.receptionHeader}>
                <Text style={styles.receptionReference}>Réf: {reception.reference}</Text>
                <Text style={styles.headerDate}>{formatDate(reception.date)}</Text>
            </View>

            {reception.reference_picture && (
                <View style={styles.imageContainer}>
                    <Text style={styles.imageTitle}>Photo de référence:</Text>
                    <Image
                        source={{ uri: `https://apimobile.testingtest.fr/storage/${reception.reference_picture}` }}
                        style={styles.referenceImage}
                    />
                </View>
            )}

            <View style={styles.receptionContent}>
                <DetailItem label="Service" value={reception.service} />
                <DetailItem
                    label="Non-conformité"
                    value={reception.non_compliance_reason || 'Aucune'}
                    color={reception.non_compliance_reason ? '#dc3545' : '#28a745'}
                />

                {reception.non_compliance_picture && (
                    <View style={styles.imageContainer}>
                        <Text style={styles.imageTitle}>Photo de non-conformité:</Text>
                        <Image
                            source={{ uri: `https://apimobile.testingtest.fr/storage/${reception.non_compliance_picture}` }}
                            style={styles.nonComplianceImage}
                        />
                    </View>
                )}

                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>Produits reçus</Text>
                    {reception.products && reception.products.length > 0 ? (
                        reception.products.map(product => (
                            <View key={product.id} style={styles.productItem}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productQuantity}>Qté: {product.pivot.quantity}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noProducts}>Aucun produit enregistré</Text>
                    )}
                </View>
            </View>
        </View>
    );

    const formatMonthTitle = (monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#008170" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {Object.keys(receptions).length > 0 ? (
                    <FlatList
                        data={Object.keys(receptions).sort().reverse()}
                        renderItem={renderMonthItem}
                        keyExtractor={(item) => item}
                        scrollEnabled={false}
                    />
                ) : (
                    <Text style={styles.noReceptions}>Aucune réception trouvée</Text>
                )}
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 16,
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
        marginHorizontal: 10,
        marginBottom: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        overflow: 'hidden',
    },
    receptionHeader: {
        backgroundColor: '#008170',
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    receptionReference: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    headerDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    receptionContent: {
        padding: 12,
    },
    detailItem: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 5,
        color: '#495057',
        width: 100,
    },
    detailValue: {
        fontSize: 14,
        color: '#212529',
        flex: 1,
    },
    imageContainer: {
        marginVertical: 10,
        paddingHorizontal: 12,
    },
    imageTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 5,
    },
    referenceImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    nonComplianceImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    productsSection: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#008170',
        marginBottom: 8,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 6,
        marginBottom: 6,
    },
    productName: {
        fontSize: 14,
        color: '#212529',
        fontWeight: '500',
    },
    productQuantity: {
        fontSize: 12,
        color: '#6c757d',
        fontWeight: '500',
    },
    noProducts: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#6c757d',
        textAlign: 'center',
        padding: 10,
    },
    noReceptions: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default HistoriqueReception;
