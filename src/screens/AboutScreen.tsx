import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

export default function AboutScreen() {
  return (
    <View style={s.container}>
      <WebView
        source={{ uri: "https://hawc-servers.com" }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator size="large" color="#0d7ff2" style={{ marginTop: 40 }} />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
