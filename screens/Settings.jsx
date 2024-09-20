import React, { useContext } from 'react';
import { Button, Image, SafeAreaView, ScrollView, Text, View, StyleSheet, Dimensions } from "react-native";
import { AuthContext } from "../context/AuthProvider";
import icons from "../constants/icons";

const Settings = () => {
    const { logout, user } = useContext(AuthContext);
    const SECTIONS = [];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.content}>
                    <View style={styles.profileSection}>
                        <View style={styles.profileInfo}>
                            <Image source={icons.avatar} style={styles.avatar} />
                            <Text style={styles.userName}>{user.name}</Text>
                        </View>
                    </View>
                    <View style={styles.logoutSection}>
                        <Button title="Déconnexion" onPress={logout} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        marginVertical: 24,
        justifyContent: '',
    },
    profileSection: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        width: '100%',
        alignItems: 'center',
    },
    avatar: {
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoutSection: {
        marginTop: 20,
    },
});

export default Settings;