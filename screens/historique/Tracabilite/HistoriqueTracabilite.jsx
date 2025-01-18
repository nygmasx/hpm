import React from 'react';
import {Button, ImageBackground, SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Dimensions} from "react-native";
import ActionModal from "../../../components/ActionModal";
import {Divider} from "@rneui/themed";
import icons from "../../../constants/icons";
import backgrounds from "../../../constants/backgrounds";
import CreateStackNavigator from "@react-navigation/stack/src/navigators/createStackNavigator";
import {NavigationContainer} from "@react-navigation/native";

const {width, height} = Dimensions.get('window');
const scale = Math.min(width, height) / 375;
const responsiveSize = (size) => size * scale;

const Stack = CreateStackNavigator();

const HistoriqueTracabilite = ({navigation}) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topSection}>
                <ActionModal
                    route="Historique Tracabilité Simplifiée"
                    navigation={navigation}
                    title="Tracabilité simplifiée"
                    subtitle="Une photo, un clic"
                    icon="barcode-sharp"
                />
                <ActionModal
                    route="Historique Tracabilité Détaillée"
                    navigation={navigation}
                    title="Tracabilité détaillée"
                    subtitle="Choix du produit, N° de lot, DLC"
                    icon="barcode-sharp"
                />
                <Divider/>
            </View>
            <View style={styles.bottomSection}>
                <Text style={styles.title}>Créer une traçabilté</Text>
                <Text style={styles.subtitle}>Alimentez l’historique des produits enregistrés</Text>
                <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.imageButton}>
                        <ImageBackground
                            style={styles.backgroundImage}
                            source={backgrounds.scan}
                            imageStyle={styles.backgroundImageStyle}
                            resizeMode="cover"
                        >
                            <View style={styles.overlay}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("Tracabilite")}
                                    style={styles.consultButton}
                                >
                                    <Text style={styles.consultButtonText}>CONSULTER</Text>
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
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: '800',
        marginBottom: height * 0.01,
    },
    subtitle: {
        fontSize: width * 0.04,
        fontWeight: '500',
        marginBottom: height * 0.02,
    },
    imageContainer: {
        width: '100%',
        paddingHorizontal: width * 0.04,
        marginVertical: height * 0.03,
    },
    imageButton: {
        height: height * 0.18,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    backgroundImageStyle: {
        borderRadius: 16,
    },
    overlay: {
        width: '100%',
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        padding: width * 0.03,
        borderRadius: 16,
    },
    consultButton: {
        width: width * 0.36,
        alignItems: 'center',
        backgroundColor: '#008170',
        borderRadius: 24,
        padding: height * 0.01,
    },
    consultButtonText: {
        color: 'white',
        fontSize: width * 0.045,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});


// Handle orientation changes
Dimensions.addEventListener('change', () => {
    const {width, height} = Dimensions.get('window');
    scale = Math.min(width, height) / 375;
});

export default HistoriqueTracabilite;
