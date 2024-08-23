import React from 'react';
import {Image, Text, TouchableOpacity, View} from "react-native";
import backgrounds from "../constants/backgrounds";

const PictureModal = ({image, imageName, imageSize}) => {
    return (
        <TouchableOpacity className="bg-secondary w-full h-28 rounded-2xl flex-row">
            <Image source={{uri: image}} className="w-1/3 h-full rounded-l-2xl"/>
            <View className="w-2/3 bg-secondary-200 rounded-r-2xl p-4" style={{gap: "5"}}>
                <Text className="font-bold text-lg">{imageName}</Text>
                <Text className="text-[16px] text-[#71727A]">{imageSize}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default PictureModal;