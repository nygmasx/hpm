import React, {useContext} from 'react';
import {Button, View} from "react-native";
import {AuthContext} from "../context/AuthProvider";

const Settings = () => {

    const {logout} = useContext(AuthContext)

    return (
        <View className="flex-1 justify-center items-center">
            <Button title="Déconnexion" onPress={logout}/>
        </View>
    );
};

export default Settings;