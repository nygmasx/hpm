import React from 'react';
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import DateTimeField from "../../components/DateTimeField";
import {Chip, Searchbar} from "react-native-paper";
import {AntDesign} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";

const NewProduct = () => {
    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <ScrollView style={{height: "100%"}}>
                <View className="w-full flex-1 px-4 my-6 justify-between flex-col space-y-4">
                    <DateTimeField title="Date d’ouverture du/des produit(s)"/>
                    <View className="space-y-4">
                        <Text className="font-bold text-lg">Durant quel service ?</Text>
                        <View className="flex-row" style={{gap: 10}}>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Matin</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Midi</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Soir</Chip>
                            <Chip className="rounded-2xl bg-[#EAF2FF]"
                                  textStyle={{color: "#008170", textTransform: "uppercase"}}>Indifférent</Chip>
                        </View>
                    </View>
                    <View style={{gap: 20}}>
                        <Text className="font-bold text-lg">Produits</Text>
                        <View className="w-full items-center space-x-4 flex-row">
                            <Searchbar className="w-4/5 bg-secondary-100" placeholder="Rechercher un produit"/>
                            <TouchableOpacity
                                className="rounded-full w-[45px] h-[45px] justify-center items-center bg-primary">
                                <AntDesign name="plus" size={24} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{height: 400}} contentContainerStyle={{gap: 10}}>
                            {products.map(product => (
                                <TouchableOpacity
                                    key={product.id}
                                    onPress={() => {
                                        navigation.navigate('Détail Produit', {productId: product.id})
                                    }}
                                    className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-4 flex-row">
                                    <View>
                                        <Text className="font-bold text-lg">{product.name}</Text>
                                        <Text>1kg</Text>
                                    </View>
                                    <View><AntDesign name="checkcircle" size={24} color="#008170"/></View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View>
                            <CustomButton title="Valider la saisie"/>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewProduct;