import 'react-native-gesture-handler';
import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Home from "./screens/Home";
import Documents from "./screens/Documents";
import History from "./screens/History";
import Settings from "./screens/Settings";
import {Image, Text, View} from "react-native";
import icons from "./constants/icons";
import Tracabilite from "./screens/tracabilite/Tracibilite";
import Temperature from "./screens/temperature/Temperature";
import Huile from "./screens/huile/Huile";
import Reception from "./screens/reception/Reception";
import Nettoyage from "./screens/nettoyage/Nettoyage";
import TcProduit from "./screens/tcp/TcProduit";

const TabIcon = ({color, icon, name, focused}) => {
    return (
        <View className="w-full flex items-center justify-center gap-2">
            <Image source={icon} resizeMode="contain" tintColor={color} className="w-[25px] h-[25px]"/>
            <Text className={`${focused ? 'font-extrabold' : 'font-normal'} text-sm`} style={{color: color}}>
                {name}
            </Text>
        </View>
    )
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
export default function App() {

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerShown: true,
                headerBackTitleVisible: false,
                headerTintColor: "#008170",
                headerTitleStyle: {color: 'black'}
            }}>
                <Stack.Screen name="Tab" component={TabNavigator} options={{headerShown: false}}/>
                <Stack.Screen name="Tracabilite" component={Tracabilite} options={{}}/>
                <Stack.Screen name="Temperature" component={Temperature}/>
                <Stack.Screen name="Huile" component={Huile}/>
                <Stack.Screen name="Reception" component={Reception}/>
                <Stack.Screen name="Nettoyage" component={Nettoyage}/>
                <Stack.Screen name="TcProduit" component={TcProduit}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}


const TabNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarActiveTintColor: "#008170",
            tabBarInactiveTintColor: "#D4D6DD",
            tabBarStyle: {
                backgroundColor: "#FFF",
                borderTopWidth: 1,
                borderTopColor: "#D4D6DD",
                height: 100,
            }
        }}>
            <Tab.Screen name="Accueil" component={Home} options={{
                title: 'Accueil', tabBarIcon: ({color, focused}) => (
                    <TabIcon icon={icons.home} color={color} name="Accueil"/>
                )
            }}/>
            <Tab.Screen name="Documents" component={Documents} options={{
                title: 'Documents', tabBarIcon: ({color, focused}) => (
                    <TabIcon icon={icons.document} color={color} name="Documents"/>
                )
            }}/>
            <Tab.Screen name="Historique" component={History} options={{
                tabBarIcon: ({color, focused}) => (
                    <TabIcon icon={icons.history} color={color} name="Historique"/>
                )
            }}/>
            <Tab.Screen name="Paramètres" component={Settings} options={{
                tabBarIcon: ({color, focused}) => (
                    <TabIcon icon={icons.settings} color={color} name="Paramètres"/>
                )
            }}/>
        </Tab.Navigator>
    )
}