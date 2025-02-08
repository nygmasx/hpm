import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Dimensions } from "react-native";
import LinkModal from "../components/LinkModal";
import backgrounds from "../constants/backgrounds";

const History = ({ navigation }) => {
    const [dimensions, setDimensions] = useState(() => {
        const { width, height } = Dimensions.get('window');
        return { width, height };
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions({ width: window.width, height: window.height });
        });

        return () => {
            // Nettoyage de l'écouteur d'événements lors du démontage
            subscription?.remove();
        };
    }, []);

    // Calculer scale dynamiquement en fonction des dimensions actuelles
    const scale = Math.min(dimensions.width, dimensions.height) / 375;
    const responsiveSize = (size) => size * scale;

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
            paddingHorizontal: responsiveSize(16),
            marginVertical: responsiveSize(24),
            gap: responsiveSize(20)
        }
    });

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

export default History;
