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
import { FontAwesome } from "@expo/vector-icons";
import { AuthContext } from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const { width, height } = Dimensions.get('window');

const HistoriqueTemperature = () => {
    const [temperatures, setTemperatures] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadTemperatures = async () => {
            try {
                const data = await fetchTemperatures(user.id);
                setTemperatures(data);
            } catch (error) {
                console.error('Error loading temperatures:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTemperatures();
    }, [user.id]);

    const fetchTemperatures = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/temperatures`);
            return response.data.reduce((acc, temperature) => {
                const date = new Date(temperature.reading_date);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(temperature);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error fetching temperatures:', error);
            throw error;
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome name="thermometer-empty" size={50} color="#008170" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Aucun relevé de température</Text>
            <Text style={styles.emptyDescription}>
                Les relevés de température que vous enregistrerez apparaîtront ici
            </Text>
        </View>
    );

    const DetailItem = ({ label, value }) => (
        <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{label}:</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );

    const renderMonthItem = ({ item: month }) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <FlatList
                data={temperatures[month]}
                renderItem={renderTemperatureItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
            />
        </View>
    );

    const renderTemperatureItem = ({ item }) => (
        <View style={styles.temperatureItem}>
            <View style={styles.readingHeader}>
                <Text style={styles.readingDate}>{formatDate(item.reading_date)}</Text>
            </View>
            {item.equipments && item.equipments.length > 0 ? (
                <FlatList
                    data={item.equipments}
                    renderItem={renderEquipmentItem}
                    keyExtractor={(equipment) => equipment.id.toString()}
                    scrollEnabled={false}
                />
            ) : (
                <Text style={styles.noEquipmentText}>Aucun équipement relevé</Text>
            )}
        </View>
    );

    const renderEquipmentItem = ({ item: equipment }) => (
        <View style={styles.equipmentItem}>
            <View style={styles.equipmentHeader}>
                <Text style={styles.equipmentName}>{equipment.name}</Text>
                <Text style={styles.equipmentType}>({equipment.type})</Text>
            </View>
            <View style={[
                styles.temperatureContainer,
                {
                    backgroundColor: getTemperatureColor(equipment.pivot.degree),
                    opacity: 0.9
                }
            ]}>
                <Text style={styles.temperature}>
                    {equipment.pivot.degree}°C
                </Text>
            </View>
        </View>
    );

    const getTemperatureColor = (temperature) => {
        if (temperature >= 8) return '#ff6b6b'; // too warm - red
        if (temperature <= 2) return '#4dabf7'; // too cold - blue
        return '#51cf66'; // good range - green
    };

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

    return (
        <SafeAreaView style={styles.container}>
            {Object.keys(temperatures).length > 0 ? (
                <FlatList
                    data={Object.keys(temperatures).sort().reverse()}
                    renderItem={renderMonthItem}
                    keyExtractor={(item) => item}
                />
            ) : (
                renderEmptyState()
            )}
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
    temperatureItem: {
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
    readingHeader: {
        backgroundColor: '#008170',
        padding: 12,
    },
    readingDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    equipmentItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    equipmentHeader: {
        flex: 1,
    },
    equipmentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    equipmentType: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    temperatureContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 60,
        alignItems: 'center',
    },
    temperature: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    detailItem: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 5,
        color: '#333',
    },
    detailValue: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyIcon: {
        marginBottom: 20,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    noEquipmentText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 15,
    }
});

export default HistoriqueTemperature;