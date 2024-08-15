import React from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Searchbar} from "react-native-paper";
import {AntDesign, MaterialCommunityIcons} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import {SelectList} from "react-native-dropdown-select-list";
import FormField from "../../components/FormField";

const TcProduit = ({navigation}) => {

    const data = [
        {key: '1', value: 'Mobiles', disabled: true},
        {key: '2', value: 'Appliances'},
        {key: '3', value: 'Cameras'},
        {key: '4', value: 'Computers', disabled: true},
        {key: '5', value: 'Vegetables'},
        {key: '6', value: 'Diary Products'},
        {key: '7', value: 'Drinks'},
    ]

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col space-y-4">
                <View style={{gap: "20"}}>
                    <View style={{gap: 10}}>
                        <Text className="font-bold text-lg">Type d'opération</Text>
                        <SelectList
                            setSelected={(value) => console.log(value)}
                            data={data}
                            boxStyles={styles.select}
                            style
                            placeholder="Refroidissement"
                        />
                    </View>
                    <Text className="font-bold text-lg">Produits réceptionnés</Text>
                    <View className="w-full items-center space-x-4 flex-row">
                        <Searchbar className="w-4/6 bg-secondary-100" placeholder="Rechercher un produit"/>
                        <TouchableOpacity
                            className="rounded-full w-[45px] h-[45px] justify-center items-center bg-primary">
                            <MaterialCommunityIcons name="barcode-scan" size={24} color="white"/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="rounded-full w-[45px] h-[45px] justify-center items-center bg-primary">
                            <AntDesign name="plus" size={24} color="white"/>
                        </TouchableOpacity>
                    </View>
                    <View className="mt-2">
                        <TouchableOpacity onPress={() => {
                            navigation.navigate('TcpOperation')
                        }}
                                          className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-4 flex-row">
                            <View>
                                <Text className="font-bold text-lg">Produit 1</Text>
                                <Text className="text-[16px] text-[#71727A]">1kg</Text>
                            </View>
                            <View><AntDesign name="checkcircle" size={24} color="#008170"/></View>
                        </TouchableOpacity>
                    </View>
                    <FormField title="Informations complémentaires"/>
                </View>
            </View>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie" handlePress={() => navigation.navigate('TcpOperation')}/>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    select: {
        width: "100%",
        paddingVertical: 20,
        borderStyle: "solid",
        borderRadius: 12,
        borderColor: "#C5C6CC",
    }
})

export default TcProduit;