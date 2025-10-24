import { StatusBar } from 'expo-status-bar';
import { StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResourceBrowse from './src/screens/ResourceBrowse';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ResourceBrowse />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
