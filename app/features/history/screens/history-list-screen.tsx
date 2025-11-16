import DetectionCard from '@/app/features/detection/_components/detection-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Alert, ScrollView, StyleSheet } from 'react-native';

export default function HistoryListScreen() {
    // TODO: Fetch history from API or local storage
    const mockHistory = [
        {
            id: '1',
            fileName: 'video_sample.mp4',
            date: '2024-01-15',
            confidence: 85,
            isDeepfake: true,
        },
        {
            id: '2',
            fileName: 'image_test.jpg',
            date: '2024-01-14',
            confidence: 15,
            isDeepfake: false,
        },
    ];

    const handlePress = (id: string) => {
        // TODO: Navigate to /features/detection/result?id=${id} when route is configured
        Alert.alert('View Result', `Opening result for ${id}`);
    };

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    Detection History
                </ThemedText>

                {mockHistory.length === 0 ? (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyText}>No detections yet</ThemedText>
                        <ThemedText style={styles.emptySubtext}>
                            Upload media to start detecting deepfakes
                        </ThemedText>
                    </ThemedView>
                ) : (
                    <ThemedView style={styles.list}>
                        {mockHistory.map((item) => (
                            <DetectionCard
                                key={item.id}
                                fileName={item.fileName}
                                date={item.date}
                                confidence={item.confidence}
                                isDeepfake={item.isDeepfake}
                                onPress={() => handlePress(item.id)}
                            />
                        ))}
                    </ThemedView>
                )}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        marginBottom: 24,
    },
    list: {
        gap: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        gap: 8,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        opacity: 0.6,
    },
});
