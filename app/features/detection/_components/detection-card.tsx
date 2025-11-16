import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable, StyleSheet } from 'react-native';

interface DetectionCardProps {
    fileName: string;
    date: string;
    confidence: number;
    isDeepfake: boolean;
    onPress: () => void;
}

export default function DetectionCard({ fileName, date, confidence, isDeepfake, onPress }: DetectionCardProps) {
    return (
        <Pressable onPress={onPress}>
            <ThemedView style={styles.card}>
                <IconSymbol
                    name={isDeepfake ? 'exclamationmark.triangle.fill' : 'checkmark.seal.fill'}
                    size={24}
                    color={isDeepfake ? '#ff3b30' : '#34c759'}
                />
                <ThemedView style={styles.content}>
                    <ThemedText type="defaultSemiBold">{fileName}</ThemedText>
                    <ThemedText style={styles.meta}>{date} • {confidence}% confidence</ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color="#888" />
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.2)',
    },
    content: {
        flex: 1,
        gap: 4,
    },
    meta: {
        fontSize: 12,
        opacity: 0.6,
    },
});
