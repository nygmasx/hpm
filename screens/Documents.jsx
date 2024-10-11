import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet,
    TextInput, Linking, Alert, RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from "../context/AuthProvider";
import axiosConfig from "../helpers/axiosConfig";
import { useFocusEffect } from '@react-navigation/native';

const DocumentItem = ({ item, onPress }) => (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.documentItem}>
        <Feather name="file-text" size={24} color="#CCCCCC" />
        <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{item.name}</Text>
            <Text style={styles.documentDate}>{item.created_at}</Text>
        </View>
    </TouchableOpacity>
);

const Documents = () => {
    const { user } = useContext(AuthContext);
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUserFiles = useCallback(async () => {
        try {
            const response = await axiosConfig.get(`/user/${user.id}/files`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching user files:', error);
        }
    }, [user.id]);

    useEffect(() => {
        fetchUserFiles();
    }, [fetchUserFiles]);

    useFocusEffect(
        useCallback(() => {
            fetchUserFiles();
        }, [fetchUserFiles])
    );

    useEffect(() => {
        applyFilters();
    }, [documents, searchText]);

    const applyFilters = () => {
        let result = documents;

        if (searchText) {
            result = result.filter(doc =>
                doc.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredDocuments(result);
    };

    const handleDocumentPress = async (document) => {
        if (!document) {
            console.error('Document is undefined');
            return;
        }
        try {
            const fileUrl = `https://apimobile.testingtest.fr/storage/${document.path}`;
            console.log(fileUrl);
            const supported = await Linking.canOpenURL(fileUrl);

            if (supported) {
                await Linking.openURL(fileUrl);
            } else {
                Alert.alert('Error', `Don't know how to open this URL: ${fileUrl}`);
            }
        } catch (error) {
            console.error('Error opening document:', error);
            Alert.alert('Error', 'Unable to open the document. Please try again later.');
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchUserFiles();
        setRefreshing(false);
    }, [fetchUserFiles]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Documents</Text>
                <TouchableOpacity onPress={() => setIsSearchVisible(!isSearchVisible)}>
                    <Feather name="search" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {isSearchVisible && (
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un document..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            )}

            <FlatList
                data={filteredDocuments}
                renderItem={({ item }) => <DocumentItem item={item} onPress={handleDocumentPress} />}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchInput: {
        backgroundColor: '#F0F0F0',
        padding: 10,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterBadge: {
        backgroundColor: '#008170',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
    },
    filterBadgeText: {
        color: 'white',
        fontSize: 12,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    documentInfo: {
        marginLeft: 16,
    },
    documentTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    documentDate: {
        fontSize: 14,
        color: '#888888',
        marginTop: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        borderTopLeftRadius: 17,
        borderTopRightRadius: 17,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    applyButton: {
        backgroundColor: '#008170',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default Documents;