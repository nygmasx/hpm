import React, {useContext, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Platform,
    UIManager,
    LayoutAnimation,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";

// Enable LayoutAnimation for iOS
if (Platform.OS === 'ios') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const Zones = ({navigation}) => {

    const [zones, setZones] = useState([])
    const {user} = useContext(AuthContext)

    useEffect(() => {
        fetchCleaningZones()
    }, []);

    const fetchCleaningZones = () => {
        axiosConfig.get(`user/${user.id}/cleaning-zones/`, {})
            .then(response => {
                console.log(`Received ${response.data.length} cleaning zones`);
                setZones(response.data);
            })
            .catch(error => {
                console.error('Error fetching cleaning zones:', error);
            });
    };

    const handleZoneSelection = (zone) => {
        navigation.navigate('Accueil Nettoyage', {
            selectedZone: zone.id,
            zoneTitle: zone.title
        });
    };

    const renderZoneCard = (zone) => (
        <TouchableOpacity
            key={zone.id}
            style={styles.zoneCard}
            onPress={() => handleZoneSelection(zone)}
            activeOpacity={0.7}
        >
            <View style={styles.zoneInfo}>
                <Text style={styles.zoneTitle}>{zone.title}</Text>
                <Text style={styles.zoneSubtitle}>
                    {zone.tasks} tâches à effectuer
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>
                    Sélectionnez une zone pour voir les tâches
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {zones.map(renderZoneCard)}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 17,
        color: '#666666',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    zoneCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    zoneInfo: {
        flex: 1,
    },
    zoneTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    zoneSubtitle: {
        fontSize: 15,
        color: '#666666',
    },
});

export default Zones;