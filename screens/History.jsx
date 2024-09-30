import React from 'react';
import {SafeAreaView, ScrollView, View} from "react-native";
import LinkModal from "../components/LinkModal";
import backgrounds from "../constants/backgrounds";

const History = ({navigation}) => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <ScrollView>
                <View className="w-full flex-1 justify-center h-full px-4 my-6" style={{gap: 20}}>
                    <LinkModal image={backgrounds.tracabilite} title="Traçabilité" navigation={navigation} route={"Historique Tracabilite"}/>
                    <LinkModal image={backgrounds.temperature} title="Température" navigation={navigation} route={"Historique Température"}/>
                    <LinkModal image={backgrounds.nettoyage} title="Plan de nettoyage" navigation={navigation} route={"Historique Plan de nettoyage"}/>
                    <LinkModal image={backgrounds.reception} title="Réception" navigation={navigation} route={"Historique Réception"}/>
                    <LinkModal image={backgrounds.huile} title="Huiles" navigation={navigation} route={"Historique Relevé Huile"}/>
                    <LinkModal image={backgrounds.tcp} title="T°C Produit" navigation={navigation} route={"TcProduit"}/>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default History;