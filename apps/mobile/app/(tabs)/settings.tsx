import { useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function SettingsScreen() {
  const [biometric, setBiometric] = useState(false);

  async function enableBiometric(value: boolean) {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enable biometric unlock for JurisAI",
      });
      if (!result.success) return;
    }
    setBiometric(value);
    await fetch(`${API_URL}/api/devices/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: "mobile-local",
        platform: "IOS",
        biometricEnabled: value,
      }),
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Biometric login</Text>
        <Switch value={biometric} onValueChange={enableBiometric} />
      </View>
      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>Open web dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 24 },
  heading: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 24 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  label: { color: "#e2e8f0", fontSize: 16 },
  link: { marginTop: 32 },
  linkText: { color: "#60a5fa" },
});
