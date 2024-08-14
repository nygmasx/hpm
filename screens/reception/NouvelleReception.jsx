import React from 'react';
import {SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet} from "react-native";
import FormField from "../../components/FormField";
import DateTimeField from "../../components/DateTimeField";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import PictureModal from "../../components/PictureModal";
import CustomButton from "../../components/CustomButton";
import {Chip, Searchbar} from "react-native-paper";
import RNPickerSelect from 'react-native-picker-select';
import {SelectList} from "react-native-dropdown-select-list";

const NouvelleReception = ({navigation}) => {

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
            <ScrollView style={{height: "100%"}} >
                <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col space-y-4">
                    <View className="flex-row items-center">
                        <View className="space-y-2">
                            <Text className="font-bold text-lg">Référence Bon de Livraison / Facture</Text>
                            <View className="flex-row w-full items-center space-x-4">
                                <View
                                    className="border-[1px] border-secondary w-5/6 h-16 px-4 rounded-[12px] focus:border-primary items-center flex-row">
                                    <TextInput
                                        className="flex-1 font-medium text-[18px] h-full w-full"
                                        placeholderTextColor="#7b7b8b"
                                    />
                                </View>
                                <TouchableOpacity
                                    className="bg-primary rounded-full items-center justify-center w-[45px] h-[45px]">
                                    <FontAwesome name="camera" size={22} color="white"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View>
                        <DateTimeField title="Date de livraison"/>
                    </View>
                    <View style={{gap: 10}}>
                        <Text className="font-bold text-lg">Fournisseur</Text>
                        <SelectList
                            setSelected={(value) => console.log(value)}
                            data={data}
                            boxStyles={styles.select}
                            style
                            placeholder="Choisir un fournisseur"
                        />
                    </View>
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
                    <View>
                        <FormField title="Informations complémentaires"/>
                    </View>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie" handlePress={() => navigation.navigate('Reception Produit')}/>
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

export default NouvelleReception;