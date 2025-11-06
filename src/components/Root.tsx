// src/screens/Root.tsx
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '../store';
import { useAppSelector } from '../store/hooks';

import TabNavigator from '../navigation/TabNavigator';
import AuthStackNavigator from '../navigation/AuthStackNavigator';

function Gate() {
  const isLoggedIn = useAppSelector(s => s.auth.isLoggedIn);
  return isLoggedIn ? <TabNavigator /> : <AuthStackNavigator />;
}

export default function Root() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Gate />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
