import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Dimensions
} from "react-native";
import { AuthContext } from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const { width, height } = Dimensions.get('window');

const HistoriqueChangementTemperature = () => {
    const [temperatureChangements, setTemperatureChangements] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadChangements = async () => {
            try {
                const data = await fetchChangements(user.id);
                setTemperatureChangements(data);
            } catch (error) {
                console.error('Error loading temperature changes:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChangements();
    }, [user.id]);

    const fetchChangements = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/temperature-changements`);
            return response.data.reduce((acc, changement) => {
                const date = new Date(changement.created_at);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(changement);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error fetching temperature changes:', error);
            throw error;
        }
    };

    const getOperationTypeColor = (type) => {
        switch (type) {
            case 'Liaison chaude':
                return '#ff6b6b';
            case 'Liaison froide':
                return '#4dabf7';
            case 'Refroidissement':
                return '#51cf66';
            default:
                return '#868e96';
        }
    };

    const getStatusColor = (isFinished) => {
        return isFinished ? '#51cf66' : '#ffd43b';
    };

    const renderMonthItem = ({ item: month }) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <FlatList
                data={temperatureChangements[month]}
                renderItem={renderChangementItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
            />
        </View>
    );

    const renderChangementItem = ({ item: changement }) => (
        <View style={styles.changementItem}>
            <View style={[styles.typeHeader, { backgroundColor: getOperationTypeColor(changement.operation_type) }]}>
                <Text style={styles.operationType}>{changement.operation_type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(changement.is_finished) }]}>
                    <Text style={styles.statusText}>
                        {changement.is_finished ? 'Terminé' : 'En cours'}
                    </Text>
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.temperatureSection}>
                    <View style={styles.temperatureBox}>
                        <Text style={styles.temperatureLabel}>Température initiale</Text>
                        <Text style={styles.temperatureValue}>{changement.start_temperature}°C</Text>
                        <Text style={styles.dateValue}>{formatDate(changement.start_date)}</Text>
                    </View>
                    {changement.is_finished && (
                        <View style={styles.temperatureBox}>
                            <Text style={styles.temperatureLabel}>Température finale</Text>
                            <Text style={styles.temperatureValue}>{changement.end_temperature}°C</Text>
                            <Text style={styles.dateValue}>{formatDate(changement.end_date)}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.productsSection}>
                    <Text style={styles.productsTitle}>Produits concernés:</Text>
                    {changement.products.map((product) => (
                        <Text key={`${changement.id}-${product.id}`} style={styles.productName}>
                            • {product.name}
                        </Text>
                    ))}
                </View>

                {changement.corrective_action && (
                    <View style={styles.correctiveAction}>
                        <Text style={styles.correctiveActionTitle}>Action corrective:</Text>
                        <Text style={styles.correctiveActionText}>{changement.corrective_action}</Text>
                    </View>
                )}
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
            day: '2-digit',
            month: '2-digit',
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

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={Object.keys(temperatureChangements).sort().reverse()}
                renderItem={renderMonthItem}
                keyExtractor={(item) => item}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
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
    changementItem: {
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
    typeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    operationType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    contentContainer: {
        padding: 12,
    },
    temperatureSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    temperatureBox: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 6,
        marginHorizontal: 4,
    },
    temperatureLabel: {
        fontSize: 12,
        color: '#495057',
        marginBottom: 4,
    },
    temperatureValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 11,
        color: '#868e96',
    },
    productsSection: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    productsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 4,
    },
    productName: {
        fontSize: 13,
        color: '#495057',
        marginLeft: 8,
        marginVertical: 2,
    },
    correctiveAction: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#fff3bf',
        borderRadius: 6,
    },
    correctiveActionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 4,
    },
    correctiveActionText: {
        fontSize: 12,
        color: '#495057',
    },
});

export default HistoriqueChangementTemperature;