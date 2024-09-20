import React from 'react';
import { Button, SafeAreaView, ScrollView, Text, View, StyleSheet, Dimensions } from "react-native";
import { Link, NavigationContainer } from "@react-navigation/native";
import Documents from "./Documents";
import { createStackNavigator } from "@react-navigation/stack";
import LinkModal from "../components/LinkModal";
import backgrounds from "../constants/backgrounds";
import CreateStackNavigator from "@react-navigation/stack/src/navigators/createStackNavigator";

const Stack = CreateStackNavigator()

const Home = ({ navigation, route }) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    <LinkModal image={backgrounds.tracabilite} title="Traçabilité" navigation={navigation} route={"Tracabilite"}/>
                    <LinkModal image={backgrounds.temperature} title="Température" navigation={navigation} route={"Temperature"}/>
                    <LinkModal image={backgrounds.nettoyage} title="Plan de nettoyage" navigation={navigation} route={"Nettoyage"}/>
                    <LinkModal image={backgrounds.reception} title="Réception" navigation={navigation} route={"Reception"}/>
                    <LinkModal image={backgrounds.huile} title="Huiles" navigation={navigation} route={"Huile"}/>
                    <LinkModal image={backgrounds.tcp} title="T°C Produit" navigation={navigation} route={"TcProduit"}/>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginVertical: 24,
        gap: 20,
    },
});

export default Home;