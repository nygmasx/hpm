import React from 'react';
import { ImageBackground, SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import ActionModal from "../../components/ActionModal";
import { Divider } from "@rneui/themed";
import backgrounds from "../../constants/backgrounds";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

const Reception = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.upperSection}>
                <TouchableOpacity
                    style={styles.newReceptionButton}
                    onPress={() => navigation.navigate("Nouvelle Reception")}>
                    <FontAwesome6 name="truck-fast" size={45} color="white"/>
                    <Text style={styles.newReceptionTitle}>Nouvelle réception</Text>
                    <Text style={styles.newReceptionSubtitle}>
                        Enregistrer un nouveau contrôle à la réception
                    </Text>
                </TouchableOpacity>
                <Divider />
            </View>

            <View style={styles.lowerSection}>
                <Text style={styles.historyTitle}>Historique des réceptions</Text>
                <Text style={styles.historySubtitle}>
                    Consultez l'historique des réceptions effectuées
                </Text>

                <View style={styles.historyContainer}>
                    <TouchableOpacity
                        style={styles.historyCard}
                        onPress={() => navigation.navigate("Tracabilite Simple")}>
                        <ImageBackground
                            style={styles.backgroundImage}
                            imageStyle={styles.backgroundImageStyle}
                            source={backgrounds.reception}
                            resizeMode={"cover"}>
                            <View style={styles.overlay}>
                                <TouchableOpacity style={styles.consultButton}>
                                    <Text style={styles.consultButtonText}>Consulter</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    upperSection: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 20
    },
    newReceptionButton: {
        width: '100%',
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#008170',
        borderRadius: 16,
        gap: 8
    },
    newReceptionTitle: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: '800',
        color: 'white'
    },
    newReceptionSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
        color: 'white'
    },
    lowerSection: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        paddingTop: 10  // Added small padding to create slight spacing from divider
    },
    historyTitle: {
        fontSize: 24,
        fontWeight: '800'
    },
    historySubtitle: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 4  // Added small margin between title and subtitle
    },
    historyContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 24
    },
    historyCard: {
        height: 144,
        flexDirection: 'column'
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end'
    },
    backgroundImageStyle: {
        borderRadius: 16
    },
    overlay: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'flex-end',
        padding: 12,
        borderRadius: 16
    },
    consultButton: {
        width: 144,
        alignItems: 'center',
        backgroundColor: '#008170',
        borderRadius: 24,
        padding: 8
    },
    consultButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'uppercase'
    }
});

export default Reception;
