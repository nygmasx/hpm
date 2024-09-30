import React, {useContext, useEffect, useState} from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import DateTimeField from "../../components/DateTimeField";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import CheckBox from "expo-checkbox";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import FormField from "../../components/FormField";
import axiosConfig from "../../helpers/axiosConfig";
import Toast from "react-native-toast-message";
import {AuthContext} from "../../context/AuthProvider";
import * as ImageManipulator from "expo-image-manipulator";

const Huile = ({navigation, route}) => {

    const [trayName, setTrayName] = useState('')
    const [checkedOilTrays, setCheckedOilTrays] = useState({});
    const [oilTrays, setOilTrays] = useState([])
    const [selectedTrays, setSelectedTrays] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const {user} = useContext(AuthContext)

    useEffect(() => {
        if (route.params?.oilTrayData) {
            setSelectedTrays(prev => [...prev, route.params.oilTrayData]);
            console.log(selectedTrays)
        }
        fetchUserOilTrays();
    }, [route.params]);

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const fetchUserOilTrays = () => {
        axiosConfig.get(`/user/${user.id}/oil-trays`, {})
            .then(response => {
                setOilTrays(response.data)
            })
            .catch(error => {
                console.error(error)
            })
    }

    const createOilTray = async () => {
        setIsLoading(true)
        const formData = new FormData();
        formData.append('name', trayName)

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.post('/oil-tray/new', formData);
            await fetchUserOilTrays()
            setIsModalVisible(!isModalVisible)
            Toast.show({
                type: 'success',
                text1: 'Bac à huiles enregistré 🟢'
            })
        } catch (error) {
            console.error(error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur, veuillez réessayer 🔴'
            })
        } finally {
            setIsLoading(false);
        }
    }

    const handleCheckboxChange = (oilTrayId, oilTrayName) => {
        setCheckedOilTrays(prevState => {
            const newCheckedZones = {...prevState, [oilTrayId]: !prevState[oilTrayId]};

            // Determine if the checkbox was checked or unchecked
            const wasChecked = prevState[oilTrayId];
            const isChecked = !wasChecked;

            if (isChecked) {
                // Navigate to product detail if checked
                navigation.navigate('Détail Bac', {oilTrayId, oilTrayName});
            } else {
                // Uncheck case: Remove the product from selectedProducts
                setSelectedTrays(prevZones => {
                    const updatedOilTray = prevZones.filter(oilTray => oilTray.oilTrayId !== oilTrayId);

                    // Alert and log data when product is removed
                    Alert.alert(
                        "Bac à huile retiré",
                        `Le produit ${oilTrayName} a été retiré de la sélection.`,
                        [{text: "OK"}]
                    );
                    console.log('Updated Selected Zone:', updatedOilTray);

                    return updatedOilTray;
                });
            }

            return newCheckedZones;
        });
    };

    const resizeImage = async (uri) => {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{resize: {width: 1080}}],
            {compress: 0.8, format: ImageManipulator.SaveFormat.JPEG}
        );
        return manipResult;
    };

    const sendAllData = async () => {
        if (selectedTrays.length === 0) {
            Alert.alert("Aucun bac à huile sélectionné", "Veuillez sélectionner au moins un bac à huile avant de soumettre.", [{text: "OK"}]);
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('date', new Date().toISOString().slice(0, 19).replace('T', ' '));

            for (let trayIndex = 0; trayIndex < selectedTrays.length; trayIndex++) {
                const tray = selectedTrays[trayIndex];
                if (tray.image) {
                    const resizedImage = await resizeImage(tray.image.uri);
                    formData.append(`oil_trays[${trayIndex}][image]`, {
                        uri: resizedImage.uri,
                        name: 'image.jpg',
                        type: 'image/jpeg',
                    });
                }
                formData.append(`oil_trays[${trayIndex}][oil_tray_id]`, tray.oilTrayId);
                formData.append(`oil_trays[${trayIndex}][control_type]`, tray.controlType);
                formData.append(`oil_trays[${trayIndex}][corrective_action]`, tray.correctiveAction);
                formData.append(`oil_trays[${trayIndex}][temperature]`, tray.temperature);
                formData.append(`oil_trays[${trayIndex}][polarity]`, tray.polarity);
            }

            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            const response = await axiosConfig.post('/oil-control/new', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log(response.data.message);
            navigation.navigate('Accueil');
            Toast.show({
                type: 'success',
                text1: 'Contrôle d\'huile enregistré 🟢'
            });
            setIsModalVisible(false);
        } catch (error) {
            console.error(error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Erreur, veuillez réessayer 🔴'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({item}) => (
        <View className="flex-row justify-between border-b-[1px] border-b-secondary p-2">
            <View className="flex-row items-center space-x-4">
                <CheckBox
                    value={!!checkedOilTrays[item.id]}
                    onValueChange={() => handleCheckboxChange(item.id, item.name)}
                    color="#008170"
                    className="rounded-full w-[25px] h-[25px]"
                />
                <Text className="font-bold text-[18px]">{item.name}</Text>
            </View>
            {!item.checked &&
                <View className="flex-row items-center space-x-1">
                    <TouchableOpacity onPress={toggleModal}>
                        <MaterialIcons name="edit" size={20} color="#008170"/>
                    </TouchableOpacity>
                    <MaterialIcons name="cancel" size={20} color="#008170"/>
                </View>
            }
        </View>
    )

    return (
        <SafeAreaView className="bg-white flex-1 h-full">
            <View>
                <Modal isVisible={isModalVisible}>
                    <View className="p-6 space-y-8 bg-white items-center rounded-2xl justify-between">
                        <View className="w-full" style={{gap: 20}}>
                            <Text className="text-xl text-center font-extrabold">Ajouter un produit</Text>
                            <View className="space-y-4">
                                <FormField
                                    title="Nom du bac à huiles"
                                    value={trayName}
                                    handleChangeText={setTrayName}
                                />
                            </View>
                        </View>
                        <View className="flex-row space-x-2 items-end">
                            <TouchableOpacity
                                className="border-primary justify-center border-2 h-14 items-center w-1/2 rounded-2xl"
                                onPress={toggleModal}
                            >
                                <Text className="text-primary text-[16px] font-semibold">Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-primary justify-center items-center h-14 w-1/2 rounded-2xl"
                                              onPress={createOilTray}
                            >
                                <Text className="text-white text-[16px] font-semibold">Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
            <View className="w-full flex-1 px-4 my-6 h-full flex-col space-y-8">
                <DateTimeField title="Date du relevé d'huile"/>
                <View className="space-y-4">
                    <View className="w-full flex-row justify-between items-center">
                        <Text className="font-semibold text-[16px]">Bac à huiles</Text>
                        <TouchableOpacity
                            onPress={toggleModal}
                            className="px-2 py-1 space-x-2 bg-primary rounded-2xl items-center flex-row">
                            <Text className="text-white font-bold ml-2">Ajouter</Text>
                            <AntDesign name="plus" size="20" color="white"/>
                        </TouchableOpacity>
                    </View>
                    <View className="space-y-2">
                        <FlatList data={oilTrays} renderItem={renderItem} keyExtractor={item => item.id}/>
                    </View>
                </View>
            </View>
            <View className="absolute bottom-0 w-full px-4 my-12">
                <CustomButton title="Valider la saisie" handlePress={sendAllData}/>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    buttons: {
        borderRadius: '50%',
        backgroundColor: "#008170",
        borderColor: "#008170"
    },

    color: {
        color: "white"
    },

    select: {
        width: "90%",
        paddingVertical: 20,
        borderStyle: "solid",
        borderRadius: 12,
        borderColor: "#C5C6CC",
    }
})

export default Huile;