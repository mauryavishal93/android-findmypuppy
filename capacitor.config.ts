import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.findmypuppy.app',
  appName: 'FindMyPuppy',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '977430971765-k7csafri1sidju96oikgr74ab0l9j4kn.apps.googleusercontent.com',
      androidClientId: '977430971765-91446b64piqpemo0ilol9v0q9mqpr59m.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
};

export default config;
