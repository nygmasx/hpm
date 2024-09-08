import React from 'react';
import {Button, ImageBackground, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import ActionModal from "../../../components/ActionModal";
import {Divider} from "@rneui/themed";
import icons from "../../../constants/icons";
import backgrounds from "../../../constants/backgrounds";
import CreateStackNavigator from "@react-navigation/stack/src/navigators/createStackNavigator";
import {NavigationContainer} from "@react-navigation/native";

const Stack = CreateStackNavigator()

const HistoriqueTracabilite = ({navigation}) => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6" style={{gap: 20}}>
                <ActionModal route="Historique Tracabilite Simplifiée" navigation={navigation} title="Tracabilité simplifiée"
                             subtitle="Une photo, un clic" icon="barcode-sharp"/>
                <ActionModal route="Tracabilite Détaillée" navigation={navigation} title="Tracabilité détaillée"
                             subtitle="Choix du produit, N° de lot, DLC"
                             icon="barcode-sharp"/>
                <Divider/>
            </View>
            <View className="w-full flex-1 items-center">
                <Text className="text-2xl font-extrabold">Créer une traçabilté</Text>
                <Text className="text-md font-medium">Alimentez l’historique des produits enregistrés</Text>
                <View className="w-full flex-1 px-4 my-6">
                    <View className="h-36 flex flex-col">
                        <ImageBackground className="w-full h-full flex justify-end" source={backgrounds.scan}
                                         imageStyle={{borderRadius: 16}}
                                         resizeMode={"cover"}>
                            <View className="w-full bg-black/50 flex-1 justify-end p-3" style={{borderRadius: 16}}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("Tracabilite")}
                                    className="w-36 items-center bg-[#008170] rounded-3xl p-2">
                                    <Text className="text-white text-lg font-semibold uppercase">Consulter</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default HistoriqueTracabilite;