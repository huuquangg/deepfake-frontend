import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();

    const menuItems: Array<{ icon: IconSymbolName; label: string; onPress: () => void }> = [
        { icon: 'person.fill', label: 'Account Settings', onPress: () => { } },
        { icon: 'bell.fill', label: 'Notifications', onPress: () => { } },
        { icon: 'info.circle.fill', label: 'About', onPress: () => { } },
        { icon: 'questionmark.circle.fill', label: 'Help & Support', onPress: () => { } },
    ];

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedView style={styles.profileSection}>
                    <ThemedView style={styles.avatar}>
                        <IconSymbol name="person.fill" size={48} color="#fff" />
                    </ThemedView>
                    <ThemedText type="title" style={styles.name}>
                        User Name
                    </ThemedText>
                    <ThemedText style={styles.email}>user@example.com</ThemedText>
                </ThemedView>

                <ThemedView style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <Pressable key={index} onPress={item.onPress}>
                            <ThemedView style={styles.menuItem}>
                                <IconSymbol
                                    name={item.icon}
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].tint}
                                />
                                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                                <IconSymbol name="chevron.right" size={20} color="#888" />
                            </ThemedView>
                        </Pressable>
                    ))}
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
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0a7ea4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    name: {
        marginBottom: 4,
    },
    email: {
        opacity: 0.6,
    },
    menuSection: {
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.2)',
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
    },
});
