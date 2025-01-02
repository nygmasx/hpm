import React, {useContext, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Dimensions} from "react-native";
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";
import Toast from "react-native-toast-message";

const {width, height} = Dimensions.get('window');

const DeleteAccount = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const {user, logout} = useContext(AuthContext);

    const handleDeleteAccount = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Veuillez saisir votre email',
            });
            return; // Arrêter l'exécution si pas d'email
        }

        if (email !== user.email) {
            Toast.show({
                type: 'error',
                text1: 'L\'email ne correspond pas à votre compte',
            });
            return;
        }

        setIsLoading(true);

        try {
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            await axiosConfig.delete('/user/delete', { data: { email } });
            Toast.show({
                type: 'success',
                text1: 'Compte supprimé avec succès',
            });
            logout();
        } catch (e) {
            Toast.show({
                type: 'error',
                text1: e.response?.data?.message || 'Erreur lors de la suppression',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.disclaimerContainer}>
                    <Text style={styles.disclaimerTitle}>Attention !</Text>
                    <Text style={styles.disclaimerText}>
                        La suppression de votre compte est une action irréversible. Toutes vos données seront
                        définitivement effacées.
                    </Text>
                    <Text style={styles.disclaimerText}>
                        Pour confirmer la suppression, veuillez saisir votre adresse e-mail ci-dessous.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {error && <Text style={styles.errorText}>{error}</Text>}
                    <FormField
                        placeholder="Confirmez votre email"
                        value={email}
                        handleChangeText={setEmail}
                    />
                </View>

                <CustomButton
                    title="Supprimer mon compte"
                    handlePress={handleDeleteAccount}
                    style={styles.deleteButton}
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        padding: width * 0.04,
        gap: height * 0.03
    },
    disclaimerContainer: {
        gap: height * 0.015,
        backgroundColor: '#FFF3F3',
        padding: width * 0.04,
        borderRadius: 8,
    },
    disclaimerTitle: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    disclaimerText: {
        fontSize: width * 0.04,
        color: '#666666',
        lineHeight: width * 0.06,
    },
    formContainer: {
        gap: height * 0.01,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: width * 0.035,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    }
});

export default DeleteAccount;