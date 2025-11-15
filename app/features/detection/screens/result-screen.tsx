import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScrollView, StyleSheet } from 'react-native';

export default function ResultScreen() {
    // TODO: Get result data from params or state
    const confidence = 85;
    const isDeepfake = confidence > 50;

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedView style={[styles.resultCard, isDeepfake ? styles.warning : styles.safe]}>
                    <IconSymbol
                        name={isDeepfake ? 'exclamationmark.triangle.fill' : 'checkmark.seal.fill'}
                        size={64}
                        color={isDeepfake ? '#ff3b30' : '#34c759'}
                    />
                    <ThemedText type="title" style={styles.resultTitle}>
                        {isDeepfake ? 'Deepfake Detected' : 'Authentic Media'}
                    </ThemedText>
                    <ThemedText style={styles.confidence}>
                        Confidence: {confidence}%
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailsSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Analysis Details
                    </ThemedText>
                    {/* TODO: Add detailed analysis results */}
                    <ThemedText>Detailed analysis information will appear here</ThemedText>
                </ThemedView>
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
    resultCard: {
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    warning: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    safe: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
    },
    resultTitle: {
        textAlign: 'center',
    },
    confidence: {
        fontSize: 18,
        fontWeight: '600',
    },
    detailsSection: {
        gap: 12,
    },
    sectionTitle: {
        marginBottom: 8,
    },
});
