module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000'
          }
        }
      ],
      [
        'react-native-vision-camera',
        {
          cameraPermissionText: '$(PRODUCT_NAME) needs access to your Camera for deepfake detection.',
          enableMicrophonePermission: true,
          microphonePermissionText: '$(PRODUCT_NAME) needs access to your Microphone for video recording.',
          enableCodeScanner: false
        }
      ]
    ]
  };
};
