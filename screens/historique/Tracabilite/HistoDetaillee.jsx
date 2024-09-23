import React, {useContext, useEffect, useState} from 'react';
import {FlatList, Image, StyleSheet, Text, View} from "react-native";
import {AuthContext} from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const HistoDetaillee = ({navigation, route}) => {

    const [tracabilities, setTracabilities] = useState()
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadTracabilities = async () => {
            try {
                const data = await fetchTracabilities(user.id);
                setTracabilities(data);
            } catch (error) {
                console.error('Error loading tracabilities:', error);
                // Handle error (e.g., show an error message)
            } finally {
                setLoading(false);
            }
            console.log(tracabilities)
        };

        loadTracabilities();
        console.log(tracabilities)
    }, [user.id]);

    const fetchTracabilities = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/advanced-tracability`);
            const tracabilities = response.data;

            // Group tracabilities by month
            return tracabilities.reduce((acc, tracability) => {
                const date = new Date(tracability.created_at);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(tracability);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error fetching tracabilities:', error);
            throw error;
        }
    };

    const renderMonthItem = ({ item: month }) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <FlatList
                data={tracabilities[month]}
                renderItem={renderTracabilityItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );

    const renderTracabilityItem = ({ item }) => (
        <View style={styles.tracabilityItem}>
            <Text style={styles.tracabilityDate}>Produits ouverts le: {formatDate(item.opened_at)}</Text>
            <Text style={styles.tracabilityDate}>Service : {item.service}</Text>
            <Text style={styles.tracabilityDate}>Service : {item.service}</Text>
            {item.images && item.images.length > 0 && (
                <FlatList
                    data={item.images}
                    renderItem={renderImageItem}
                    keyExtractor={(img, index) => `${item.id}-img-${index}`}
                    horizontal
                />
            )}
            {item.products && item.products.length > 0 && (
                <View style={styles.productsContainer}>
                    <Text style={styles.productsTitle}>Produits:</Text>
                    {item.products.map(product => (
                        <Text key={product.id} style={styles.productItem}>
                            {product.name} {product.brand ? `(${product.brand})` : ''}
                            - Quantité : {product.pivot.quantity}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );

    const renderImageItem = ({ item }) => {
        const imageUrl = `https://apimobile.testingtest.fr/storage/${item.url}`;
        console.log('Image URL:', imageUrl);

        return (
            <Image
                source={{ uri: imageUrl }}
                style={styles.tracabilityImage}
                onError={(e) => console.error('Error loading image:', e.nativeEvent.error)}
                onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            />
        );
    };

    const formatMonthTitle = (monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <FlatList
            data={Object.keys(tracabilities).sort().reverse()}
            renderItem={renderMonthItem}
            keyExtractor={(item) => item}
        />
    );
};

const styles = StyleSheet.create({
    monthContainer: {
        marginBottom: 20,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    tracabilityItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tracabilityDate: {
        fontSize: 14,
        color: '#666',
    },
    tracabilityId: {
        fontSize: 16,
        marginTop: 5,
    },
    tracabilityImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        marginRight: 10,
        marginTop: 10,
    },
});

export default HistoDetaillee;