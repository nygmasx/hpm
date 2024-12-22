import React, {useState, useEffect, useContext} from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Platform,
    UIManager,
    LayoutAnimation,
    ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axiosConfig from "../../helpers/axiosConfig";
import {AuthContext} from "../../context/AuthProvider";
import Toast from "react-native-toast-message";

// Enable LayoutAnimation for iOS
if (Platform.OS === 'ios') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const ListeTaches = ({route}) => {
    const {selectedZone, zoneTitle} = route.params;
    const [tasks, setTasks] = useState([]);
    const [expandedTask, setExpandedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {user} = useContext(AuthContext);

    useEffect(() => {
        fetchTasks();
    }, [selectedZone]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            const response = await axiosConfig.get(`/cleaning-zone/${selectedZone}/tasks`);
            // Filtrer les tâches non complétées
            const incompleteTasks = response.data.filter(task => !task.is_completed);
            setTasks(incompleteTasks);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des tâches');
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTaskExpansion = (taskId) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };

    // Ajouter cette fonction pour compléter une tâche
    const completeTask = async (taskId) => {
        try {
            setLoading(true);
            const request = await axiosConfig.put(`/cleaning-tasks/${taskId}/complete`);

            await fetchTasks()

            console.log(request.data)
            // Actualiser toutes les tâches après la complétion
            setError(null);
        } catch (err) {
            setError('Erreur lors de la mise à jour de la tâche');
            console.error('Error completing task:', err);
        } finally {
            Toast.show({
                type: 'success',
                text1: 'Tâche complétée avec succès',
            });
            setLoading(false);
        }
    };
    const handleTaskAction = async (task) => {
        if (!task.is_completed) {
            await completeTask(task.id);
        }
    };

    const renderTask = (task) => {
        const isExpanded = expandedTask === task.id;

        return (
            <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => toggleTaskExpansion(task.id)}
                activeOpacity={0.7}
            >
                <View style={styles.taskHeader}>
                    <View style={styles.taskTitleContainer}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <View style={[styles.statusBadge,
                            {backgroundColor: task.is_completed ? '#4CAF50' : '#FFC107'}]}>
                            <Text style={styles.frequencyText}>{task.frequency}</Text>
                        </View>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="#008170"
                    />
                </View>

                {isExpanded && (
                    <View style={styles.taskDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={20} color="#666"/>
                            <Text style={styles.detailText}
                                  className="font-bold">Poste: {task.cleaning_station.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={20} color="#666"/>
                            <Text style={styles.detailText}>Temps estimé: {task.estimated_time}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="flask-outline" size={20} color="#666"/>
                            <Text style={styles.detailText}>Produits: {task.products}</Text>
                        </View>
                        {task.products_quantity && (
                            <View style={styles.detailRow}>
                                <Ionicons name="beaker-outline" size={20} color="#666"/>
                                <Text style={styles.detailText}>Quantité: {task.products_quantity}</Text>
                            </View>
                        )}
                        {task.temperature && (
                            <View style={styles.detailRow}>
                                <Ionicons name="thermometer-outline" size={20} color="#666"/>
                                <Text style={styles.detailText}>Température: {task.temperature}</Text>
                            </View>
                        )}
                        {task.verification_type && (
                            <View style={styles.detailRow}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#666"/>
                                <Text style={styles.detailText}>Vérification: {task.verification_type}</Text>
                            </View>
                        )}
                        {task.utensil && (
                            <View style={styles.detailRow}>
                                <Ionicons name="construct-outline" size={20} color="#666"/>
                                <Text style={styles.detailText}>Ustensile: {task.utensil}</Text>
                            </View>
                        )}
                        {task.rinse_type && (
                            <View style={styles.detailRow}>
                                <Ionicons name="water-outline" size={20} color="#666"/>
                                <Text style={styles.detailText}>Type de rinçage: {task.rinse_type}</Text>
                            </View>
                        )}
                        {task.drying_type && (
                            <View style={styles.detailRow}>
                                <Ionicons name="sunny-outline" size={20} color="#666"/>
                                <Text style={styles.detailText}>Type de séchage: {task.drying_type}</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.startButton, task.is_completed && styles.completedButton]}
                            onPress={() => handleTaskAction(task)}
                            disabled={task.is_completed}
                        >
                            <Text style={styles.startButtonText}>
                                {task.is_completed ? 'Tâche complétée' : 'Compléter la tâche'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    {tasks.filter(task => !task.is_completed).length > 0 ? (
                        tasks.filter(task => !task.is_completed).map(renderTask)
                    ) : (
                        <Text style={styles.noTasksText}>Aucune tâche disponible pour cette zone</Text>
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchTasks}>
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {tasks.length > 0 ? (
                    tasks.map(renderTask)
                ) : (
                    <Text style={styles.noTasksText}>Vous avez compléter toutes les tâches pour cette zone</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#008170',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    taskCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    taskTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000000',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    frequencyText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    taskDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    detailText: {
        fontSize: 15,
        color: '#666666',
    },
    startButton: {
        backgroundColor: '#008170',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    completedButton: {
        backgroundColor: '#4CAF50',
    },
    noTasksText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginTop: 24,
    }
});

export default ListeTaches;