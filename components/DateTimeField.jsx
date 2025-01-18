import React, { useState, useEffect } from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const scale = Math.min(width, height) / 375;
const responsiveSize = (size) => size * scale;

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
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.fieldsWrapper}>
                <View style={styles.datePickerContainer}>
                    <RNDateTimePicker
                        style={styles.picker}
                        mode="date"
                        value={date}
                        display="default"
                        onChange={onDateChange}
                    />
                    <Ionicons
                        name="calendar-clear"
                        size={responsiveSize(24)}
                        color="#008170"
                    />
                </View>
                <View style={styles.timePickerContainer}>
                    <RNDateTimePicker
                        style={styles.picker}
                        mode="time"
                        value={time}
                        display="default"
                        onChange={onTimeChange}
                    />
                    <Ionicons
                        name="time"
                        size={responsiveSize(24)}
                        color="#008170"
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: responsiveSize(16)
    },
    title: {
        fontWeight: 'bold',
        fontSize: responsiveSize(18),
        includeFontPadding: false
    },
    fieldsWrapper: {
        flexDirection: 'row',
        gap: responsiveSize(20),
        width: '100%'
    },
    datePickerContainer: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#C5C6CC', // Replace with your secondary color
        height: responsiveSize(64),
        paddingHorizontal: responsiveSize(16),
        borderRadius: responsiveSize(12),
        gap: responsiveSize(8)
    },
    timePickerContainer: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#C5C6CC', // Replace with your secondary color
        height: responsiveSize(64),
        paddingHorizontal: responsiveSize(16),
        borderRadius: responsiveSize(12),
        gap: responsiveSize(8)
    },
    picker: {
        alignSelf: 'center'
    }
});

// Handle orientation changes
const updateLayout = () => {
    const { width, height } = Dimensions.get('window');
    scale = Math.min(width, height) / 375;
};

Dimensions.addEventListener('change', updateLayout);

export default DateTimeField;