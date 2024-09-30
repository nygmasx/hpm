import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const HistoriqueNettoyage = () => {
    const [cleaningPlans, setCleaningPlans] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadCleaningPlans = async () => {
            try {
                const data = await fetchCleaningPlans(user.id);
                setCleaningPlans(data);
            } catch (error) {
                console.error('Error loading cleaning plans:', error);
                // Handle error (e.g., show an error message)
            } finally {
                setLoading(false);
            }
        };

        loadCleaningPlans();
    }, [user.id]);

    const fetchCleaningPlans = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/cleaning-plans`);
            const cleaningPlans = response.data;
            console.log('Fetched cleaning plans:', cleaningPlans);

            // Group cleaning plans by month
            return cleaningPlans.reduce((acc, cleaningPlan) => {
                const date = new Date(cleaningPlan.created_at);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(cleaningPlan);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error fetching cleaning plans:', error);
            throw error;
        }
    };

    const renderMonthItem = ({ item: month }) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <FlatList
                data={cleaningPlans[month]}
                renderItem={renderCleaningPlanItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );

    const renderCleaningPlanItem = ({ item: plan }) => (
        <View style={styles.planContainer}>
            <Text style={styles.planDate}>Date: {formatDate(plan.date)}</Text>
            {plan.zones && plan.zones.length > 0 ? (
                <FlatList
                    data={plan.zones}
                    renderItem={renderZoneItem}
                    keyExtractor={(zone, index) => `${plan.id}-zone-${index}`}
                />
            ) : (
                <Text style={styles.noZones}>Aucune zone enregistrée</Text>
            )}
        </View>
    );

    const renderZoneItem = ({ item: zone }) => (
        <View style={styles.zoneContainer}>
            <Text style={styles.zoneName}>{zone.name}</Text>
            {zone.pivot && (
                <>
                    <Text style={styles.zoneComment}>{zone.pivot.comment || 'Pas de commentaire'}</Text>
                    {zone.pivot.image_url && (
                        <Text style={styles.zoneImage}>Image disponible</Text>
                    )}
                </>
            )}
        </View>
    );

    const formatMonthTitle = (monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <FlatList
            data={Object.keys(cleaningPlans).sort().reverse()}
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
    planContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    planDate: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    noZones: {
        fontStyle: 'italic',
        color: '#666',
    },
    zoneContainer: {
        marginLeft: 10,
        marginTop: 5,
    },
    zoneName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    zoneComment: {
        fontSize: 12,
        color: '#666',
    },
    zoneImage: {
        fontSize: 12,
        color: 'blue',
        marginTop: 2,
    },
});

export default HistoriqueNettoyage;