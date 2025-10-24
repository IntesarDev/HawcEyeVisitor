import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from '../navigation/TabNavigator';

const Root = () => {
  return (
     <SafeAreaProvider>
    <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
  </SafeAreaProvider>
  )
}

export default Root



