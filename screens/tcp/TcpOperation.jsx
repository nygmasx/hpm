import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SelectList} from "react-native-dropdown-select-list";
import {Searchbar} from "react-native-paper";
import {AntDesign, FontAwesome, MaterialCommunityIcons} from "@expo/vector-icons";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import DateTimeField from "../../components/DateTimeField";
import Counter from "react-native-counters";
import {CheckBox} from "@rneui/base";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const TcpOperation = () => {

    const [check, setCheck] = useState(false)
    const [selected, setSelected] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const handleCheck = () => {
        setCheck(!check)
        setSelected(!selected)
    }

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View className="w-full flex-1 px-4 my-6 h-full justify-between flex-col space-y-4">
                <View style={{gap: 20}}>
                    <View className="w-full border-[1px] p-4 rounded-2xl border-secondary">
                        <Text className="text-center text-xl font-bold">Refroidissement</Text>
                    </View>
                    <DateTimeField title="Date de début"/>
                    <View style={{gap: 10}}>
                        <Text className="font-bold text-lg">Température de début</Text>
                        <Counter buttonStyle={styles.buttons} buttonTextStyle={styles.color}/>
                    </View>
                    <CheckBox wrapperStyle={{padding: 0, margin: 0, borderStyle: "solid"}} containerStyle={{padding: 0, margin: 0}} checkedIcon={
                        <AntDesign name="checkcircle" size={26} color="#008170"/>
                    } uncheckedIcon={
                        <FontAwesome name="circle" size={26} color="#8F9098"/>
                    } checked={check} onPress={handleCheck}/>
                    <View className="flex-row justify-between border-b-[1px] border-b-secondary">
                        <View className="flex-row items-center">

                            <Text className="font-bold text-[16px]">A</Text>
                        </View>
                        {!selected &&
                            <View className="flex-row items-center space-x-1">
                                <TouchableOpacity onPress={toggleModal}>
                                    <MaterialIcons name="edit" size={20}
                                                   color="#008170"/>
                                </TouchableOpacity>
                                <MaterialIcons name="cancel" size={20} color="#008170"/>
                            </View>
                        }
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    buttons: {
        borderRadius: '50%',
        backgroundColor: "#008170",
        borderColor: "#008170"
    },

    color: {
        color: "white"
    },

    select: {
        width: "90%",
        paddingVertical: 20,
        borderStyle: "solid",
        borderRadius: 12,
        borderColor: "#C5C6CC",
    }
})


export default TcpOperation;