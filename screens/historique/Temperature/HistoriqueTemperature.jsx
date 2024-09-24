import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

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
                // Handle error (e.g., show an error message)
            } finally {
                setLoading(false);
            }
        };

        loadTemperatures();
    }, [user.id]);

    const fetchTemperatures = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/temperatures`);
            const temperatures = response.data;
            console.log('Fetched temperatures:', temperatures);

            // Group temperatures by month
            return temperatures.reduce((acc, temperature) => {
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

    const renderMonthItem = ({ item: month }) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <FlatList
                data={temperatures[month]}
                renderItem={renderTemperatureItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );

    const renderTemperatureItem = ({ item }) => (
        <View style={styles.temperatureItem}>
            <Text style={styles.readingDate}>Date: {formatDate(item.reading_date)}</Text>
            <FlatList
                data={item.equipments}
                renderItem={renderEquipmentItem}
                keyExtractor={(equipment) => equipment.id.toString()}
            />
        </View>
    );

    const renderEquipmentItem = ({ item: equipment }) => (
        <View style={styles.equipmentItem}>
            <Text style={styles.equipmentName}>{equipment.name} ({equipment.type})</Text>
            <Text style={styles.temperature}>Température: {equipment.pivot.degree}°C</Text>
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
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <FlatList
            data={Object.keys(temperatures).sort().reverse()}
            renderItem={renderMonthItem}
            keyExtractor={(item) => item}
        />
    );
};

const styles = StyleSheet.create({
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
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    readingDate: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    equipmentItem: {
        marginLeft: 10,
        marginBottom: 5,
    },
    equipmentName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    temperature: {
        fontSize: 14,
    },
});

export default HistoriqueTemperature;