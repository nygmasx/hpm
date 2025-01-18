import React, {useContext, useEffect} from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Linking
} from 'react-native';
import {Feather} from '@expo/vector-icons';
import icons from "../constants/icons";
import {AuthContext} from "../context/AuthProvider";

const {width, height} = Dimensions.get('window');
const scale = width / 320;

const normalize = (size) => {
    const newSize = size * scale;
    return Math.round(newSize);
};

const SettingsItem = ({title, icon, route, handlePress}) => (
    <TouchableOpacity
        onPress={handlePress}
        style={styles.settingsItem}
    >
        <Text style={styles.settingsItemText}>{title}</Text>
        <Feather name="chevron-right" size={normalize(24)} color="#000"/>
    </TouchableOpacity>
);

const Settings = ({navigation}) => {
    const {user, logout} = useContext(AuthContext);

    const handlePrivacyPress = async () => {
        try {
            await Linking.openURL('https://tally.so/r/mDvkep');
        } catch (error) {
            console.error('An error occurred while opening the privacy policy:', error);
        }
    };
    const goToContactForm = async () => {
        try {
            await Linking.openURL('https://tally.so/r/w21Bd9');
        } catch (error) {
            console.error('An error occurred while opening the privacy policy:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={icons.avatar}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.userName}>{user.email}</Text>
                </View>

                <SettingsItem
                    title="Confidentialité et sécurité"
                    handlePress={handlePrivacyPress}
                />
                <SettingsItem title="Nous contacter - Service client" handlePress={goToContactForm}/>
                <SettingsItem title="Mon Abonnement"/>
                <SettingsItem title="Déconnexion" handlePress={logout}/>
                <SettingsItem title="Supprimer mon compte" handlePress={() => navigation.navigate('Delete Account')}/>
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
        paddingBottom: normalize(20),
    },
    title: {
        fontSize: normalize(24),
        fontWeight: 'bold',
        marginTop: normalize(20),
        marginBottom: normalize(20),
        marginLeft: normalize(20),
    },
    profileSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: normalize(30),
    },
    avatarContainer: {
        width: normalize(100),
        height: normalize(100),
        justifyContent: "center",
        alignItems: "center"
    },
    editButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#4CAF50',
        borderRadius: normalize(15),
        width: normalize(30),
        height: normalize(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: normalize(20),
        fontWeight: 'bold',
    },
    userSubtitle: {
        fontSize: normalize(16),
        color: '#666',
    },
    settingsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: normalize(15),
        paddingHorizontal: normalize(20),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
    },
    settingsItemText: {
        fontSize: normalize(16),
    },
});

export default Settings;