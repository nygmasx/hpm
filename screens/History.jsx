import React from 'react';
import {SafeAreaView, ScrollView, View, StyleSheet, Dimensions} from "react-native";
import LinkModal from "../components/LinkModal";
import backgrounds from "../constants/backgrounds";

const {width, height} = Dimensions.get('window');
const scale = Math.min(width, height) / 375;
const responsiveSize = (size) => size * scale;

const History = ({navigation}) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    <LinkModal
                        image={backgrounds.tracabilite}
                        title="Traçabilité"
                        navigation={navigation}
                        route="Historique Tracabilite"
                    />
                    <LinkModal
                        image={backgrounds.temperature}
                        title="Température"
                        navigation={navigation}
                        route="Historique Température"
                    />
                    <LinkModal
                        image={backgrounds.nettoyage}
                        title="Plan de nettoyage"
                        navigation={navigation}
                        route="Historique Plan de nettoyage"
                    />
                    <LinkModal
                        image={backgrounds.reception}
                        title="Réception"
                        navigation={navigation}
                        route="Historique Réception"
                    />
                    <LinkModal
                        image={backgrounds.huile}
                        title="Huiles"
                        navigation={navigation}
                        route="Historique Relevé Huile"
                    />
                    <LinkModal
                        image={backgrounds.tcp}
                        title="T°C Produit"
                        navigation={navigation}
                        route="Historique Tcp"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%'
    },
    content: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        height: '100%',
        paddingHorizontal: responsiveSize(16), // px-4
        marginVertical: responsiveSize(24), // my-6
        gap: responsiveSize(20)
    }
});

// Handle orientation changes
Dimensions.addEventListener('change', () => {
    const {width, height} = Dimensions.get('window');
    scale = Math.min(width, height) / 375;
});

export default History;