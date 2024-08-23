import React from 'react';
import {ActivityIndicator, Text, View} from "react-native";
import {TouchableOpacity} from "react-native";

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading}) => {
    return (
        <TouchableOpacity
            onPress={handlePress}
            className={`bg-primary rounded-xl min-h-[62px] justify-center items-center
            ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
            activeOpacity={0.7}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator
                    style={{marginRight: 18}}
                    size="large"
                    color="white"
                />
            ) : (
                <Text className={`text-white text-lg font-semibold ${textStyles}`}>{title}</Text>
            )}
        </TouchableOpacity>

    );
};

export default CustomButton;