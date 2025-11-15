import { Image } from 'expo-image';
import { Alert, StyleSheet } from 'react-native';

import QuickActionCard from '@/app/features/home/components/quick-action-card';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
    const handleUploadPress = () => {
        // TODO: Navigate to /features/detection/upload when route is configured
        Alert.alert('Coming Soon', 'Upload feature will be available soon');
    };

    const handleHistoryPress = () => {
        // TODO: Navigate to /features/history/list when route is configured
        Alert.alert('Coming Soon', 'History feature will be available soon');
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={styles.headerImage}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Deepfake Detector</ThemedText>
            </ThemedView>

            <ThemedView style={styles.descriptionContainer}>
                <ThemedText>
                    Detect manipulated media with advanced AI technology. Upload images or videos to verify their authenticity.
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.actionsContainer}>
                <QuickActionCard
                    title="Upload Media"
                    description="Analyze an image or video"
                    icon="photo.fill"
                    onPress={handleUploadPress}
                />
                <QuickActionCard
                    title="View History"
                    description="See past detections"
                    icon="clock.fill"
                    onPress={handleHistoryPress}
                />
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    descriptionContainer: {
        marginBottom: 24,
    },
    actionsContainer: {
        gap: 16,
    },
});
