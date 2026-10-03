import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pgautopilot.app',
  appName: 'PG Rent Autopilot',
  webDir: 'out',
  server: {
    // Uses bundled production web assets from 'out' directory
    // Uses a secure non-localhost internal app hostname for native WebViews
    hostname: 'app.pgautopilot.internal',
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      showSpinner: true,
      spinnerColor: '#4f46e5',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
