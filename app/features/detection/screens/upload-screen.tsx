import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

export default function UploadScreen() {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const colorScheme = useColorScheme();
    const tintColor = Colors[colorScheme ?? 'light'].tint;

    const handleSelectImage = () => {
        // TODO: Implement image picker
        Alert.alert('Coming Soon', 'Image picker will be implemented');
    };

    const handleSelectVideo = () => {
        // TODO: Implement video picker
        Alert.alert('Coming Soon', 'Video picker will be implemented');
    };

    const handleAnalyze = () => {
        // TODO: Implement analysis
        Alert.alert('Coming Soon', 'Analysis will be implemented');
    };

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    Upload Media
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Select an image or video to analyze for deepfake detection
                </ThemedText>

                <ThemedView style={styles.uploadSection}>
                    <Pressable onPress={handleSelectImage} style={styles.uploadButton}>
                        <ThemedView style={styles.uploadButtonContent}>
                            <IconSymbol name="photo.fill" size={48} color={tintColor} />
                            <ThemedText type="defaultSemiBold">Select Image</ThemedText>
                            <ThemedText style={styles.uploadHint}>PNG, JPG up to 10MB</ThemedText>
                        </ThemedView>
                    </Pressable>

                    <Pressable onPress={handleSelectVideo} style={styles.uploadButton}>
                        <ThemedView style={styles.uploadButtonContent}>
                            <IconSymbol name="video.fill" size={48} color={tintColor} />
                            <ThemedText type="defaultSemiBold">Select Video</ThemedText>
                            <ThemedText style={styles.uploadHint}>MP4, MOV up to 50MB</ThemedText>
                        </ThemedView>
                    </Pressable>
                </ThemedView>

                {selectedFile && (
                    <Pressable onPress={handleAnalyze} style={[styles.analyzeButton, { backgroundColor: tintColor }]}>
                        <ThemedText style={styles.analyzeButtonText}>Analyze Media</ThemedText>
                    </Pressable>
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
        marginBottom: 8,
    },
    subtitle: {
        marginBottom: 24,
        opacity: 0.7,
    },
    uploadSection: {
        gap: 16,
        marginBottom: 24,
    },
    uploadButton: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(128, 128, 128, 0.3)',
        borderRadius: 12,
        padding: 32,
    },
    uploadButtonContent: {
        alignItems: 'center',
        gap: 8,
    },
    uploadHint: {
        fontSize: 12,
        opacity: 0.5,
    },
    analyzeButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    analyzeButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
