import React, {createContext, useState} from "react";
import * as SecureStore from 'expo-secure-store';
import axiosConfig from "../helpers/axiosConfig";
import {Platform} from "react-native";

export const AuthContext = createContext();
const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const [error, setError] = useState(false)
    const [isLoading, setIsLoading] = useState(null)

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                error,
                isLoading,
                register: async (email, password) => {
                    setIsLoading(true);
                    try {
                        const response = await axiosConfig.post('/register', {
                            email,
                            password,
                            device_name: 'mobile',
                        });

                        const userResponse = {
                            token: response.data.token,
                            id: response.data.user.id,
                            email: response.data.user.email,
                        };

                        setUser(userResponse);
                        setError(null);
                        await SecureStore.setItemAsync('user', JSON.stringify(userResponse));
                    } catch (error) {
                        console.log(error.response?.data);
                        setError(error.response?.data?.message || 'Une erreur est survenue');
                    } finally {
                        setIsLoading(false);
                    }
                },
                login: (email, password) => {
                    setIsLoading(true);
                    axiosConfig
                        .post('/login', {
                            email,
                            password,
                            device_name: 'mobile',
                        })
                        .then(response => {
                            const userResponse = {
                                token: response.data.token,
                                id: response.data.user.id,
                                name: response.data.user.name,
                                email: response.data.user.email,
                            };

                            setUser(userResponse);
                            setError(null);
                            SecureStore.setItemAsync('user', JSON.stringify(userResponse));
                            setIsLoading(false);
                        })
                        .catch(error => {
                            console.log(error.response);
                            setError(error.response.data.message);
                            setIsLoading(false);
                        });
                },
                logout: () => {
                    setIsLoading(true);
                    axiosConfig.defaults.headers.common[
                        'Authorization'
                        ] = `Bearer ${user.token}`;
                    axiosConfig
                        .post('/logout')
                        .then(response => {
                            setUser(null);
                            SecureStore.deleteItemAsync('user');
                            setError(null);
                            setIsLoading(false);
                        })
                        .catch(error => {
                            console.log(error);
                            setUser(null);
                            SecureStore.deleteItemAsync('user');
                            setError(error.response.data.message);
                            setIsLoading(false);
                        });
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;