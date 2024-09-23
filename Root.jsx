import 'react-native-gesture-handler';
import React, {useContext, useEffect, useState} from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Home from "./screens/Home";
import Documents from "./screens/Documents";
import History from "./screens/History";
import Settings from "./screens/Settings";
import {ActivityIndicator, Image, Text, View} from "react-native";
import icons from "./constants/icons";
import Tracabilite from "./screens/tracabilite/Tracabilite";
import Temperature from "./screens/temperature/Temperature";
import Huile from "./screens/huile/Huile";
import Reception from "./screens/reception/Reception";
import Nettoyage from "./screens/nettoyage/Nettoyage";
import TcProduit from "./screens/tcp/TcProduit";
import TracabiliteSimple from "./screens/tracabilite/TracabiliteSimple";
import TracabiliteFirst from "./screens/tracabilite/Détaillée/TracabiliteFirst";
import DetailProduit from "./screens/tracabilite/Détaillée/DetailProduit";
import ListePostes from "./screens/nettoyage/ListePostes";
import NouvelleReception from "./screens/reception/NouvelleReception";
import ReceptionProduit from "./screens/reception/ReceptionProduit";
import ReceptionFinal from "./screens/reception/ReceptionFinal";
import TcpOperation from "./screens/tcp/TcpOperation";
import AuthProvider, {AuthContext} from "./context/AuthProvider";
import LoginScreen from "./screens/Auth/Login/LoginScreen";
import RegisterScreen from "./screens/Auth/Register/RegisterScreen";
import AuthHome from "./screens/Auth/AuthHome";
import * as SecureStore from 'expo-secure-store';
import Toast from "react-native-toast-message";
import HistoriqueTracabilite from "./screens/historique/Tracabilite/HistoriqueTracabilite";
import HistoSimplifiee from "./screens/historique/Tracabilite/HistoSimplifiee";
import DetailBac from "./screens/huile/DetailBac";
import HistoDetaillee from "./screens/historique/Tracabilite/HistoDetaillee";

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

    const [isLoading, setIsLoading] = useState(true)
    const {user, setUser} = useContext(AuthContext)

    useEffect(() => {
        // check si l'user est connecté ou pas
        SecureStore.getItemAsync('user')
            .then(userString => {
                if (userString) {
                    setUser(JSON.parse(userString));
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });

    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="gray"/>
            </View>
        );
    }

    return (
        <>
            {user ? (
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{
                        headerShown: true,
                        headerBackTitleVisible: false,
                        headerTintColor: "#008170",
                        headerTitleStyle: {color: 'black'}
                    }}>
                        <Stack.Screen name="Tab" component={TabNavigator} options={{headerShown: false}}/>
                        <Stack.Screen name="Tracabilite" component={Tracabilite} options={{}}/>
                        <Stack.Screen name="Tracabilite Simple" component={TracabiliteSimple}
                                      options={{title: "Traçabilité simplifiée"}}/>
                        <Stack.Screen name="Tracabilite Détaillée" component={TracabiliteFirst}
                                      options={{title: "Traçabilité Détaillée"}}/>
                        <Stack.Screen name="Détail Produit" component={DetailProduit} options={{title: ""}}/>
                        <Stack.Screen name="Temperature" component={Temperature}/>
                        <Stack.Screen name="Huile" component={Huile} options={{title: "Contrôle d'huiles "}}/>
                        <Stack.Screen name="Détail Bac" component={DetailBac} options={{title: ""}}/>
                        <Stack.Screen name="Reception" component={Reception}/>
                        <Stack.Screen name="Nouvelle Reception" component={NouvelleReception}
                                      options={{title: "Réception planifiée"}}/>
                        <Stack.Screen name="Reception Produit" component={ReceptionProduit}
                                      options={{title: "Réception planifiée"}}/>
                        <Stack.Screen name="Reception Final" component={ReceptionFinal}
                                      options={{title: "Réception planifiée"}}/>
                        <Stack.Screen name="Nettoyage" component={Nettoyage}/>
                        <Stack.Screen name="Liste Postes" component={ListePostes}/>
                        <Stack.Screen name="TcProduit" component={TcProduit} options={{title: "T°C produit"}}/>
                        <Stack.Screen name="TcpOperation" component={TcpOperation} options={{title: "T°C - Produit"}}/>
                        <Stack.Screen name="Historique Tracabilite" component={HistoriqueTracabilite} options={{title: "Historique de traçabilité"}}/>
                        <Stack.Screen name="Historique Tracabilité Simplifiée" component={HistoSimplifiee} options={{title: "Historique de traçabilité simplifiée"}}/>
                        <Stack.Screen name="Historique Tracabilité Détaillée" component={HistoDetaillee} options={{title: "Historique de traçabilité détaillée"}}/>
                    </Stack.Navigator>
                </NavigationContainer>
            ) : (
                <NavigationContainer>
                    <AuthStackNavigator/>
                </NavigationContainer>
            )}
            <Toast/>
        </>

    );
}

const AuthStackNavigator = () => {

    return (
        <Stack.Navigator screenOptions={{
            headerShown: true,
            headerBackTitleVisible: false,
            headerTintColor: "#008170",
            headerTitleStyle: {color: 'black'}
        }}>
            <Stack.Screen name="Auth Home" component={AuthHome} options={{headerShown: false}}/>
            <Stack.Screen name="Login Screen" component={LoginScreen} options={{headerShown: false}}/>
            <Stack.Screen name="Register Screen" component={RegisterScreen} options={{}}/>
        </Stack.Navigator>
    )
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
                ), headerShown: true
            }}/>
            <Tab.Screen name="Paramètres" component={Settings} options={{
                tabBarIcon: ({color, focused}) => (
                    <TabIcon icon={icons.settings} color={color} name="Paramètres"/>
                ), headerShown: true
            }}/>
        </Tab.Navigator>
    )
}