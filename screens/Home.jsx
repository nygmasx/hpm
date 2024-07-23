import React from 'react';
import {Button, SafeAreaView, ScrollView, Text, View} from "react-native";
import {Link, NavigationContainer} from "@react-navigation/native";
import Documents from "./Documents";
import {createStackNavigator} from "@react-navigation/stack";
import LinkModal from "../components/LinkModal";
import backgrounds from "../constants/backgrounds";
import CreateStackNavigator from "@react-navigation/stack/src/navigators/createStackNavigator";

const Stack = CreateStackNavigator()


const Home = ({navigation, route}) => {

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <ScrollView>
                <View className="w-full flex-1 justify-center h-full px-4 my-6" style={{gap: 20}}>
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

export default Home;