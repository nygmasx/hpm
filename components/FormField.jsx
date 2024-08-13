import React, {useState} from 'react';
import {Text, TextInput, TouchableOpacity, View} from "react-native";

const FormField = ({title, value, otherStyles, placeholder, handleChangeText, ...props}) => {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <View className="space-y-2">
            <Text className="font-bold text-lg">{title}</Text>

            <View
                className="border-[1px] border-secondary w-full h-16 px-4 rounded-[12px] focus:border-primary items-center flex-row">
                <TextInput
                    className="flex-1 font-medium text-[18px] h-full w-full"
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    secureTextEntry={title === 'Password' && !showPassword}
                />
                {title === "Password" && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image className="w-6 h-6" source={!showPassword ? icons.eye : icons.eyeHide}/>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default FormField;