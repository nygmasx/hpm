import React, {useState} from 'react';
import {Text, TextInput, TouchableOpacity, View, Image, StyleSheet} from "react-native";
import icons from "../constants/icons";

const FormField = ({title, name, value, otherStyles, placeholder, handleChangeText, multiline, ...props}) => {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    secureTextEntry={name === 'Password' && !showPassword}
                    multiline={multiline}
                />
                {name === "Password" && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image style={styles.icon} source={!showPassword ? icons.eye : icons.eyeHide}/>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18, // equivalent to text-lg
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#C5C6CC',
        width: '100%',
        height: 64, // equivalent to h-16
        paddingHorizontal: 16, // equivalent to px-4
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
    },
    input: {
        flex: 1,
        fontWeight: '500', // equivalent to font-medium
        fontSize: 18,
        height: '100%',
        width: '100%',
    },
    icon: {
        width: 24, // equivalent to w-6
        height: 24, // equivalent to h-6
    }
});

export default FormField;