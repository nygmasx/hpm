import React, { useState, useEffect } from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const DateTimeField = ({ title, onChange }) => {
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [combinedDateTime, setCombinedDateTime] = useState('');

    useEffect(() => {
        updateCombinedDateTime();
    }, [date, time]);

    const updateCombinedDateTime = () => {
        const combined = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes(),
            time.getSeconds()
        );
        const formattedDateTime = combined.toISOString().slice(0, 19).replace('T', ' ');
        setCombinedDateTime(formattedDateTime);
        if (onChange) {
            onChange(formattedDateTime);
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
    };

    const onTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        setTime(currentTime);
    };

    return (
        <View className="space-y-4">
            <Text className="font-bold text-lg">{title}</Text>
            <View style={{ flexDirection: "row", gap: 20 }}>
                <View className="border-[1px] flex space-x-2 border-secondary w-4/7 h-16 px-4 rounded-[12px] focus:border-primary justify-center items-center flex-row">
                    <RNDateTimePicker
                        className="text-center"
                        mode="date"
                        value={date}
                        display="default"
                        onChange={onDateChange}
                    />
                    <Ionicons name="calendar-clear" size={24} color="#008170" />
                </View>
                <View className="border-[1px] flex space-x-2 border-secondary w-2/5 h-16 px-4 rounded-[12px] focus:border-primary justify-center items-center flex-row">
                    <RNDateTimePicker
                        className="text-center"
                        mode="time"
                        value={time}
                        display="default"
                        onChange={onTimeChange}
                    />
                    <Ionicons name="time" size={24} color="#008170" />
                </View>
            </View>
        </View>
    );
};

export default DateTimeField;