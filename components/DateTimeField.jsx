import React, {useState} from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {Text, TextInput, TouchableOpacity, View} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const DateTimeField = ({title}) => {

    const [date, setDate] = useState(new Date())
    const [time, setTime] = useState(new Date())
    const [showPicker, setShowPicker] = useState(false)
    const toggleDatePicker = () => {
        setShowPicker(!showPicker)
    }
    const onChange = ({type}, selectedDate) => {
        if (type == "set") {
            const currentDate = selectedDate
            setDate(currentDate)
        }
    }

    return (
        <View className="space-y-4">
            <Text className="font-bold text-lg">{title}</Text>
            <View style={{flexDirection: "row", gap: "20"}}>
                <View
                    className="border-[1px] flex space-x-2 border-secondary w-4/7 h-16 px-4 rounded-[12px] focus:border-primary justify-center items-center flex-row">
                    <RNDateTimePicker className="text-center" mode="date" value={time} display="compact"
                                      onChange={onChange}/>
                    <Ionicons name="calendar-clear" size={24} color="#008170" />
                </View>
                <View
                    className="border-[1px] flex space-x-2 border-secondary w-2/5 h-16 px-4 rounded-[12px] focus:border-primary justify-center items-center flex-row">
                    <RNDateTimePicker className="text-center" mode="time" value={date} display="compact" onChange={onChange}/>
                    <Ionicons name="time" size={24} color="#008170" />
                </View>
            </View>

        </View>
    );
};

export default DateTimeField;