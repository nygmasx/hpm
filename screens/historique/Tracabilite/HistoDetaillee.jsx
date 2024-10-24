import React, { useContext, useEffect, useState } from 'react';
import {
    SafeAreaView,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    Dimensions
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { AuthContext } from "../../../context/AuthProvider";
import axiosConfig from "../../../helpers/axiosConfig";

const { width, height } = Dimensions.get('window');

const HistoDetaillee = ({ navigation, route }) => {
    const [tracabilities, setTracabilities] = useState({});
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadTracabilities = async () => {
            try {
                const data = await fetchTracabilities(user.id);
                setTracabilities(data);
            } catch (error) {
                console.error('Error loading tracabilities:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTracabilities();
    }, [user.id]);

    const fetchTracabilities = async (userId) => {
        try {
            const response = await axiosConfig.get(`/user/${userId}/advanced-tracability`);
            return response.data.reduce((acc, tracability) => {
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

    const DetailItem = ({ label, value }) => (
        <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{label}:</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome name="inbox" size={50} color="#008170" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Aucune traçabilité détaillée</Text>
            <Text style={styles.emptyDescription}>
                Les traçabilités détaillées que vous enregistrerez apparaîtront ici
            </Text>
        </View>
    );

    const renderMonthItem = ({ item: month }) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{formatMonthTitle(month)}</Text>
            <FlatList
                data={tracabilities[month]}
                renderItem={renderTracabilityItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
            />
        </View>
    );

    const renderTracabilityItem = ({ item }) => (
        <View style={styles.tracabilityItem}>
            <View style={styles.detailsContainer}>
                <DetailItem label="Produits ouverts le" value={formatDate(item.opened_at)} />
                <DetailItem label="Service" value={item.service} />
            </View>

            {item.images && item.images.length > 0 ? (
                <View style={styles.imagesContainer}>
                    <Text style={styles.sectionTitle}>Photos:</Text>
                    <FlatList
                        data={item.images}
                        renderItem={renderImageItem}
                        keyExtractor={(img, index) => `${item.id}-img-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            ) : (
                <Text style={styles.noImagesText}>Aucune photo disponible</Text>
            )}

            {item.products && item.products.length > 0 ? (
                <View style={styles.productsContainer}>
                    <Text style={styles.sectionTitle}>Produits:</Text>
                    {item.products.map(product => (
                        <View key={product.id} style={styles.productItem}>
                            <Text style={styles.productName}>
                                {product.name} {product.brand ? `(${product.brand})` : ''}
                            </Text>
                            <Text style={styles.productQuantity}>
                                Qté: {product.pivot.quantity}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.noProductsText}>Aucun produit enregistré</Text>
            )}
        </View>
    );

    const renderImageItem = ({ item }) => {
        const imageUrl = `https://apimobile.testingtest.fr/storage/${item.url}`;
        return (
            <TouchableOpacity
                onPress={() => {
                    setSelectedImage(imageUrl);
                    setModalVisible(true);
                }}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.tracabilityImage}
                    onError={(e) => console.error('Error loading image:', e.nativeEvent.error)}
                />
            </TouchableOpacity>
        );
    };

    const formatMonthTitle = (monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#008170" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {Object.keys(tracabilities).length > 0 ? (
                <FlatList
                    data={Object.keys(tracabilities).sort().reverse()}
                    renderItem={renderMonthItem}
                    keyExtractor={(item) => item}
                />
            ) : (
                renderEmptyState()
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <FontAwesome name="close" size={24} color="black" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
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
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    detailsContainer: {
        marginBottom: 10,
    },
    detailItem: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 5,
        color: '#333',
        width: 140,
    },
    detailValue: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#008170',
    },
    imagesContainer: {
        marginVertical: 10,
    },
    tracabilityImage: {
        width: 120,
        height: 120,
        resizeMode: 'cover',
        marginRight: 10,
        borderRadius: 8,
    },
    productsContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    productItem: {
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 6,
        marginBottom: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    productQuantity: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyIcon: {
        marginBottom: 20,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    noImagesText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    },
    noProductsText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: width * 0.02,
        width: width * 0.92,
        height: height * 0.7,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: height * 0.01,
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
});

export default HistoDetaillee;