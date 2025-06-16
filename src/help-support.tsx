import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HelpSupport() {
  const [query, setQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ data
  const faqs = [
    {
      id: 1,
      question: "How do I know when there’s a new pickup?",
      answer:
        "You’ll get a notification on your phone when a new pickup is assigned. Tap it to view details.",
    },
    {
      id: 2,
      question: "What if I can’t find the donor’s location?",
      answer:
        "Use the map link in the pickup details. If you’re still lost, contact support or the donor.",
    },
    {
      id: 3,
      question: "What if the donor isn’t there?",
      answer:
        "Wait for 5–10 minutes. If they still don’t show up, mark it as “Donor Not Available” and contact support.",
    },
    {
      id: 4,
      question: "Can I reject a pickup?",
      answer:
        "No. Once a pickup is assigned, you are expected to complete it. If there’s an issue, contact support.",
    },
  ];

  // Toggle FAQ expansion
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Handle contact methods
  const handleContactMethod = (method) => {
    switch (method) {
      case "email":
        Linking.openURL("mailto:support@yourapp.com");
        break;
      case "phone":
        Linking.openURL("tel:+18001234567");
        break;
      case "chat":
        Alert.alert(
          "Live Chat",
          "Connecting you to the next available support agent...",
          [{ text: "OK" }]
        );
        break;
      default:
        break;
    }
  };

  // Handle search query submission
  const handleSearch = () => {
    if (query.trim()) {
      Alert.alert("Searching Help Center", `Searching for: "${query}"`, [
        { text: "OK" },
      ]);
      // In a real app, this would trigger a search in your help database
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Search Bar */}

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactOptionsContainer}>
            <ContactOption
              icon="email"
              title="Email Support"
              description="Get help via email"
              onPress={() => handleContactMethod("email")}
            />
            <ContactOption
              icon="phone"
              title="Call Support"
              description="Talk to the store manager"
              onPress={() => handleContactMethod("phone")}
            />
          </View>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(faq.id)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <MaterialIcons
                    name={
                      expandedFaq === faq.id
                        ? "keyboard-arrow-up"
                        : "keyboard-arrow-down"
                    }
                    size={24}
                    color="#4A6FE3"
                  />
                </TouchableOpacity>
                {expandedFaq === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Contact Option Component
const ContactOption = ({ icon, title, description, onPress }: any) => (
  <TouchableOpacity style={styles.contactOption} onPress={onPress}>
    <View style={styles.contactIconContainer}>
      <MaterialIcons name={icon} size={28} color="#4A6FE3" />
    </View>
    <Text style={styles.contactTitle}>{title}</Text>
    <Text style={styles.contactDescription}>{description}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4A6FE3",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  placeholder: {
    width: 24, // Same as back button icon for symmetry
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  section: {
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  contactOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactOption: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  contactDescription: {
    fontSize: 12,
    color: "#8D8D8D",
    textAlign: "center",
  },
  faqContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  faqAnswer: {
    padding: 15,
    paddingTop: 0,
    backgroundColor: "#F9FAFF",
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
  },
  helpCenterImageContainer: {
    margin: 15,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpCenterImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  helpCenterTextContainer: {
    alignItems: "center",
  },
  helpCenterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  helpCenterDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 22,
  },
  helpCenterButton: {
    backgroundColor: "#4A6FE3",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  helpCenterButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
