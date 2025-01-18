import React, { useContext, useEffect, useState, useRef } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import ActionModal from "../../components/ActionModal";
import { Divider } from "@rneui/themed";
import axiosConfig from "../../helpers/axiosConfig";
import { AuthContext } from "../../context/AuthProvider";

const { width, height } = Dimensions.get('window');

const TWO_HOURS_IN_SECONDS = 7200;

const Tcp = ({ navigation, route }) => {
    const [tcps, setTcps] = useState([]);
    const { user } = useContext(AuthContext);
    const [remainingTime, setRemainingTime] = useState({});
    const timerRefs = useRef({});

    useEffect(() => {
        fetchUserTcps();

        const unsubscribe = navigation.addListener('focus', () => {
            if (route.params?.newTcpCreated) {
                fetchUserTcps();
                navigation.setParams({ newTcpCreated: false });
            }
        });

        return () => {
            unsubscribe();
            Object.values(timerRefs.current).forEach(clearInterval);
        };
    }, [navigation, route.params?.newTcpCreated]);

    const fetchUserTcps = async () => {
        try {
            const response = await axiosConfig.get(`/user/${user.id}/temperature-changement`);
            setTcps(response.data);
            startTimersForCoolingOperations(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const startTimersForCoolingOperations = (tcpData) => {
        tcpData.forEach(tcp => {
            if (tcp.operation_type === 'Refroidissement' && tcp.is_finished === 0) {
                const startTime = new Date(tcp.start_date).getTime();
                const currentTime = new Date().getTime();
                const elapsedTime = Math.floor((currentTime - startTime) / 1000);
                const remainingTimeInSeconds = Math.max(TWO_HOURS_IN_SECONDS - elapsedTime, 0);

                setRemainingTime(prev => ({ ...prev, [tcp.id]: remainingTimeInSeconds }));
                startTimer(tcp.id, remainingTimeInSeconds);
            }
        });
    };

    const startTimer = (tcpId, initialTime) => {
        if (timerRefs.current[tcpId]) {
            clearInterval(timerRefs.current[tcpId]);
        }

        timerRefs.current[tcpId] = setInterval(() => {
            setRemainingTime(prev => {
                const updatedTime = prev[tcpId] - 1;
                if (updatedTime <= 0) {
                    clearInterval(timerRefs.current[tcpId]);
                    return { ...prev, [tcpId]: 0 };
                }
                return { ...prev, [tcpId]: updatedTime };
            });
        }, 1000);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handlePress = (id) => {
        navigation.navigate('Modifier Tcp', { id });
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.topSection}>
                    <ActionModal
                        route="TcProduit"
                        navigation={navigation}
                        title="Nouvelle opération"
                        subtitle="Démarrer un changement de température"
                        icon="barcode-sharp"
                    />
                    <Divider />
                </View>
                {tcps.length > 0 && (
                    <View style={styles.bottomSection}>
                        <Text style={styles.title}>Opérations en cours</Text>
                        <View style={styles.imageContainer}>
                            {tcps.map(tcp => (
                                <TouchableOpacity onPress={() => handlePress(tcp.id)} key={tcp.id} style={styles.productItem}>
                                    <View>
                                        <Text style={styles.productName}>{tcp.operation_type}</Text>
                                        <Text style={styles.productSubtext}>
                                            {tcp.products.map(product => product.name).join(', ')}
                                        </Text>
                                        {tcp.operation_type === 'Refroidissement' && remainingTime[tcp.id] !== undefined && (
                                            <Text style={[
                                                styles.timerText,
                                                remainingTime[tcp.id] <= 0 ? styles.timerTextOverdue : null
                                            ]}>
                                                Temps restant: {formatTime(remainingTime[tcp.id])}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topSection: {
        flex: 1,
        width: '100%',
        paddingHorizontal: width * 0.04,
        marginVertical: height * 0.03,
        gap: height * 0.025,
    },
    bottomSection: {
        flex: 1,
        width: '100%',
        paddingHorizontal: width * 0.04,
        alignItems: 'center',
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: '800',
        marginBottom: height * 0.01,
    },
    imageContainer: {
        width: '100%',
        marginVertical: height * 0.03,
        gap: height * 0.015,
    },
    productItem: {
        backgroundColor: '#F5F5F5',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        padding: width * 0.04,
    },
    productName: {
        fontWeight: '700',
        fontSize: width * 0.045,
    },
    productSubtext: {
        fontSize: width * 0.035,
        color: '#666',
    },
    timerText: {
        fontSize: width * 0.035,
        fontWeight: 'bold',
        color: '#008170',
        marginTop: height * 0.01,
    },
    timerTextOverdue: {
        color: 'red',
    },
});

export default Tcp;