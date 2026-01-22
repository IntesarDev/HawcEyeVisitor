import React, { useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AboutScreen() {
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const unsubBeforeRemove = navigation.addListener("beforeRemove", (e) => {
        if (showBack && canGoBack && webRef.current) {
          e.preventDefault();
          webRef.current.goBack();
        }
      });

      const unsubHW =
        Platform.OS === "android"
          ? BackHandler.addEventListener("hardwareBackPress", () => {
              if (showBack && canGoBack && webRef.current) {
                webRef.current.goBack();
                return true;
              }
              return false;
            })
          : { remove: () => {} };

      return () => {
        unsubBeforeRemove();
        unsubHW.remove();
      };
    }, [canGoBack, showBack, navigation])
  );

  const handleBack = () => {
    if (showBack && canGoBack && webRef.current) {
      webRef.current.goBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={s.container}>
      {showBack && (
        <Pressable onPress={handleBack} style={s.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0d7ff2" />
          <Text style={s.backText}>Back</Text>
        </Pressable>
      )}

      <WebView
        ref={webRef}
        source={{ uri: "https://hawc-servers.com" }}
        onNavigationStateChange={(st) => {
          setCanGoBack(st.canGoBack);
        }}
        onShouldStartLoadWithRequest={(req) => {
          if (req.navigationType === "click") {
            setShowBack(true);
          }
          return true;
        }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#0d7ff2"
            style={{ marginTop: 40 }}
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#ffffffee",
    borderRadius: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0d7ff2",
  },
});
