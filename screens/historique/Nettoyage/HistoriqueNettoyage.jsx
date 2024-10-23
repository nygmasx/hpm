import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Image,
    TouchableOpacity,
    Modal,
    Dimensions
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { AuthContext } from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const { width, height } = Dimensions.get('window');

const HistoriqueNettoyage = () => {
    const [cleaningPlans, setCleaningPlans] = useState({});
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadCleaningPlans = async () => {
            try {
                const data = await fetchCleaningPlans(user.id);
                setCleaningPlans(data);
            } catch (error) {
                console.error('Error loading cleaning plans:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCleaningPlans();
    }, [user.id]);

    const fetchCleaningPlans = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/cleaning-plans`);
            console.log('API Response:', response.data);

            return response.data.reduce((acc, plan) => {
                const date = new Date(plan.created_at);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(plan);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error fetching cleaning plans:', error);
            throw error;
        }
    };

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
                data={cleaningPlans[month]}
                renderItem={renderCleaningPlanItem}
                keyExtractor={(item) => `plan-${item.id}`}
                scrollEnabled={false}
            />
        </View>
    );

    const renderCleaningPlanItem = ({ item: plan }) => (
        <View style={styles.planContainer}>
            <Text style={styles.planReference}>Plan de nettoyage #{plan.id}</Text>
            <Text style={styles.controlDate}>{formatDate(plan.date)}</Text>
            {Array.isArray(plan.zones) && plan.zones.length > 0 ? (
                <FlatList
                    data={plan.zones}
                    renderItem={renderZoneItem}
                    keyExtractor={(zone, index) => `${plan.id}-zone-${index}`}
                    scrollEnabled={false}
                />
            ) : (
                <Text style={styles.noZones}>Aucune zone enregistrée</Text>
            )}
        </View>
    );

    const renderZoneItem = ({ item: zone }) => {
        const imageUrl = zone.pivot?.image_url
            ? zone.pivot.image_url
            : null;

        return (
            <View style={styles.trayContainer}>
                <Text style={styles.trayName}>{zone.name || 'Zone sans nom'}</Text>
                <View style={styles.detailsContainer}>
                    <DetailItem
                        label="Date de nettoyage"
                        value={formatDate(zone.pivot?.created_at)}
                    />
                    {zone.pivot?.comment && (
                        <DetailItem
                            label="Commentaire"
                            value={zone.pivot.comment}
                        />
                    )}
                </View>
                {imageUrl && (
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedImage(imageUrl);
                            setModalVisible(true);
                        }}
                    >
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.trayImage}
                            onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
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
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#008170" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={Object.keys(cleaningPlans).sort().reverse()}
                renderItem={renderMonthItem}
                keyExtractor={(item) => `month-${item}`}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <FontAwesome name="close" size={24} color="black" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    planContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    planReference: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    controlDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    noZones: {
        fontStyle: 'italic',
        color: '#666',
    },
    trayContainer: {
        marginLeft: 10,
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    trayName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#008170',
    },
    detailsContainer: {
        marginTop: 5,
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
    trayImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginTop: 10,
        borderRadius: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: width * 0.02,
        width: width * 0.92,
        height: height * 0.7,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: height * 0.01,
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
});

export default HistoriqueNettoyage;