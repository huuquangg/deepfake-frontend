import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Pressable, StyleSheet } from 'react-native';

interface QuickActionCardProps {
    title: string;
    description: string;
    icon: IconSymbolName;
    onPress: () => void;
}

export default function QuickActionCard({ title, description, icon, onPress }: QuickActionCardProps) {
    const colorScheme = useColorScheme();
    const tintColor = Colors[colorScheme ?? 'light'].tint;

    return (
        <Pressable onPress={onPress}>
            <ThemedView style={styles.card}>
                <IconSymbol name={icon} size={32} color={tintColor} style={styles.icon} />
                <ThemedView style={styles.content}>
                    <ThemedText type="defaultSemiBold">{title}</ThemedText>
                    <ThemedText style={styles.description}>{description}</ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color={tintColor} />
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
    icon: {
        flexShrink: 0,
    },
    content: {
        flex: 1,
        gap: 4,
    },
    description: {
        fontSize: 12,
        opacity: 0.7,
    },
});
