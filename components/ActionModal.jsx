import React from 'react';
import {Image, Text, TouchableOpacity, View} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const ActionModal = ({route, title, icon, subtitle}) => {
    return (
        <TouchableOpacity className="w-full h-40 items-center justify-center flex flex-col bg-[#008170] rounded-[16px]" onPress={() => navigation.navigate(`${route}`)}>
            <Ionicons name={icon} size={50} color="white" />
            <Text className="text-2xl text-center font-extrabold text-white">{title}</Text>
            <Text className="text-sm text-center font-medium text-white">{subtitle}</Text>
        </TouchableOpacity>
    );
};

export default ActionModal;