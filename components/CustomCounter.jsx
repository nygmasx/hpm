import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput} from 'react-native';

const CustomCounter = ({
                           initial = 0,
                           min = 0,
                           max = 10,
                           handleChange,
                           increaseButtonBackgroundColor = '#008170',
                           decreaseButtonBackgroundColor = '#008170',
                           textInputStyle,
                           type
                       }) => {
    const [count, setCount] = useState(initial);

    useEffect(() => {
        handleChange(count);  // Call handleChange whenever count changes
    }, [count]);

    const handleIncrease = () => {
        if (count < max) {
            setCount(count + 1);
        }
    };

    const handleDecrease = () => {
        if (count > min) {
            setCount(count - 1);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, {backgroundColor: decreaseButtonBackgroundColor}]}
                onPress={handleDecrease}
            >
                <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>

            <TextInput
                style={[styles.textInput, textInputStyle]}
                value={`${count}${type === "degree" ? " °C" : ""}`}
                editable={false}
                keyboardType="numeric"
            />

            <TouchableOpacity
                style={[styles.button, {backgroundColor: increaseButtonBackgroundColor}]}
                onPress={handleIncrease}
            >
                <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    textInput: {
        width: 60,
        height: 40,
        textAlign: 'center',
        fontSize: 24,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
    },
});

export default CustomCounter;
