import React, {useEffect, useState} from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from "react-native";
import FormField from "../../../components/FormField";
import DateTimeField from "../../../components/DateTimeField";
import {FontAwesome, Ionicons} from "@expo/vector-icons";
import PictureModal from "../../../components/PictureModal";
import CustomButton from "../../../components/CustomButton";
import {Chip, Searchbar} from "react-native-paper";
import {AntDesign} from '@expo/vector-icons';
import axios, {Axios} from "axios";

const TracabiliteFirst = ({navigation}) => {

    const [data, setData] = useState([])

    useEffect(() => {
        getAllProducts()
    }, []);

    function getAllProducts() {
        axios.get("https://apimobile.testingtest.fr/api/products")
            .then(response => {
                setData(response.data)
            })
            .catch(error => {
                console.log(error)
            })
    }

    const renderItem = ({item}) => (
        <TouchableOpacity onPress={() => {
            navigation.navigate('Détail Produit')
        }}
                          className="bg-secondary-200 w-full items-center justify-between rounded-2xl p-4 flex-row">
            <View>
                <Text className="font-bold text-lg">{item.name}</Text>
                <Text className="text-[16px] text-[#71727A]">1kg</Text>
            </View>
            <View><AntDesign name="checkcircle" size={24} color="#008170"/></View>
        </TouchableOpacity>
    )

    const gap = 10;

    return (
        <View className="bg-white flex-1 h-full">
            <ScrollView style={{height: "100%"}}>
                <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col space-y-4">
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
                    <View style={{gap: "20"}}>
                        <Text className="font-bold text-lg">Produits</Text>
                        <View className="w-full items-center space-x-4 flex-row">
                            <Searchbar className="w-4/5 bg-secondary-100" placeholder="Rechercher un produit"/>
                            <TouchableOpacity
                                className="rounded-full w-[45px] h-[45px] justify-center items-center bg-primary">
                                <AntDesign name="plus" size={24} color="white"/>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            contentContainerStyle={{gap}}
                            columnWrapperStyle={{gap}}
                            key={2}
                        />
                    </View>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie"/>
            </View>
        </View>
    );
};

export default TracabiliteFirst;