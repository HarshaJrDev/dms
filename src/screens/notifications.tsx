import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const pickups = [
  {
    id: "1",
    location: "Green Cross Blood Bank",
    time: "2 min ago",
  },
  {
    id: "2",
    location: "Red Heart Center",
    time: "20 min ago",
  },
  {
    id: "3",
    location: "City Hospital",
    time: "1 hr ago",
  },
];

export default function NotificationsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialIcons name="local-shipping" size={22} color="#D32F2F" />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title}>New Pickup Request</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pickups}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    backgroundColor: "#FFEBEE",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    color: "#333",
  },
  location: {
    fontSize: 14,
    color: "#444",
  },
  time: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});