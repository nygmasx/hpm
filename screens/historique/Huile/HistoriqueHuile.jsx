import React, {useContext, useEffect, useState} from 'react';
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
import {AuthContext} from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const { width, height } = Dimensions.get('window');

const HistoriqueHuile = () => {
    const [oilControls, setOilControls] = useState({});
    const [loading, setLoading] = useState(true);
    const {user} = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const loadOilControls = async () => {
            try {
                const data = await fetchOilControls(user.id);
                setOilControls(data);
            } catch (error) {
                console.error('Error loading oil controls:', error);
                // Handle error (e.g., show an error message)
            } finally {
                setLoading(false);
            }
        };

        loadOilControls();
    }, [user.id]);

    const fetchOilControls = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/oil-controls`);
            const oilControls = response.data;
            console.log('Fetched oil controls:', oilControls);

            // Group oil controls by month
            return oilControls.reduce((acc, control) => {
                const date = new Date(control.date);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(control);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error fetching oil controls:', error);
            throw error;
        }
    };

    const renderMonthItem = ({item: month}) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <FlatList
                data={oilControls[month]}
                renderItem={renderOilControlItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );

    const renderOilControlItem = ({item: control}) => (
        <View style={styles.controlContainer}>
            <Text style={styles.controlDate}>Date: {formatDate(control.date)}</Text>
            {control.oil_trays && control.oil_trays.length > 0 ? (
                <FlatList
                    data={control.oil_trays}
                    renderItem={renderOilTrayItem}
                    keyExtractor={(tray) => tray.id.toString()}
                />
            ) : (
                <Text style={styles.noTrays}>Aucun bac à huile enregistré</Text>
            )}
        </View>
    );

    const renderOilTrayItem = ({item: tray}) => {
        const imageUrl = tray.pivot.image_url
            ? `https://apimobile.testingtest.fr/storage/${tray.pivot.image_url}`
            : null;

        console.log('Tray image URL:', imageUrl);

        return (
            <View style={styles.trayContainer}>
                <Text style={styles.trayName}>{tray.name}</Text>
                <View style={styles.detailsContainer}>
                    <DetailItem label="Type de contrôle" value={tray.pivot.control_type}/>
                    <DetailItem label="Température" value={`${tray.pivot.temperature}°C`}/>
                    <DetailItem label="Polarité" value={tray.pivot.polarity}/>
                    <DetailItem label="Action corrective" value={tray.pivot.corrective_action}/>
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

    const DetailItem = ({label, value}) => (
        <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{label}:</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );

    const formatMonthTitle = (monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', {month: 'long', year: 'numeric'});
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff"/>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={Object.keys(oilControls).sort().reverse()}
                renderItem={renderMonthItem}
                keyExtractor={(item) => item}
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
    controlContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    controlDate: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    noTrays: {
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
    },
    detailValue: {
        fontSize: 14,
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

export default HistoriqueHuile;