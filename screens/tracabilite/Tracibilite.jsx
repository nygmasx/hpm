import React from 'react';
import {Button, ImageBackground, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import ActionModal from "../../components/ActionModal";
import {Divider} from "@rneui/themed";
import icons from "../../constants/icons";
import backgrounds from "../../constants/backgrounds";

const Tracabilite = () => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6" style={{gap: 20}}>
                <ActionModal route="" title="Tracabilité simplifiée" subtitle="Une photo, un clic" icon="barcode-sharp"/>
                <ActionModal title="Tracabilité détaillée" subtitle="Choix du produit, N° de lot, DLC"
                             icon="barcode-sharp"/>
                <Divider/>
            </View>
            <View className="w-full flex-1 items-center">
                <Text className="text-2xl font-extrabold">Historique de traçabilté</Text>
                <Text className="text-md font-medium">Consultez l’historique des produits enregistrés</Text>
                <View className="w-full flex-1 px-4 my-6">
                    <TouchableOpacity className="h-36 flex flex-col" onPress={() => navigation.navigate(`${route}`)}>
                        <ImageBackground className="w-full h-full flex justify-end" source={backgrounds.scan} imageStyle={{borderRadius: 16}}
                                         resizeMode={"cover"}>
                            <View className="w-full bg-black/50 flex-1 justify-end p-3" style={{borderRadius: 16}}>
                                <TouchableOpacity className="w-36 items-center bg-[#008170] rounded-3xl p-2">
                                    <Text className="text-white text-lg font-semibold uppercase">Consulter</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default Tracabilite;