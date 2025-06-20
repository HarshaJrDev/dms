 import { StyleSheet } from "react-native";

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: "#F6F8FF" },
//     ordersCardContainer: {
//       position: "absolute",
//       bottom: 0,
//       left: 0,
//       right: 0,
//       backgroundColor: "#fff",
//       borderTopLeftRadius: 24,
//       borderTopRightRadius: 24,
//       padding: 20,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: -2 },
//       shadowOpacity: 0.08,
//       shadowRadius: 6,
//       elevation: 6,
//       minHeight: 220,
//     },
//     ordersHeading: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#333" },
//     ordersSubtext: { color: "#A7A7A7", marginBottom: 8 },
//     ordersScroll: { marginBottom: 12 },
//     orderGroup: { marginRight: 16 },
//     ordersGroupHeading: { fontSize: 16, fontWeight: "600", color: "#4A6FE3", marginBottom: 8 },
//     orderCard: {
//       backgroundColor: "#F6F8FF",
//       borderRadius: 14,
//       padding: 12,
//       width: 240,
//       marginBottom: 12,
//       borderWidth: 2,
//       borderColor: "#F6F8FF",
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 1 },
//       shadowOpacity: 0.08,
//       shadowRadius: 2,
//       elevation: 2,
//     },
//     orderCardSelected: {
//       borderColor: "#4A6FE3",
//       backgroundColor: "#E8EDFF",
//     },
//     orderCardContent: {
//       flexDirection: "row",
//       alignItems: "center",
//     },
//     avatarCircle: {
//       width: 40,
//       height: 40,
//       borderRadius: 20,
//       backgroundColor: "#4A6FE3",
//       justifyContent: "center",
//       alignItems: "center",
//       marginRight: 12,
//     },
//     avatarText: {
//       color: "#fff",
//       fontSize: 16,
//       fontWeight: "600",
//     },
//     orderDetails: {
//       flex: 1,
//     },
//     donorName: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: "#333",
//     },
//     orderTime: {
//       fontSize: 14,
//       color: "#666",
//       marginTop: 2,
//     },
//     orderAddress: {
//       fontSize: 14,
//       color: "#666",
//       marginTop: 2,
//     },
//     orderEta: {
//       fontSize: 14,
//       color: "#4A6FE3",
//       marginTop: 2,
//     },
//     selectedStops: {
//       fontSize: 14,
//       color: "#333",
//       marginBottom: 8,
//     },
//     routeInfo: {
//       fontSize: 14,
//       color: "#333",
//     },
//     modalOverlay: {
//       flex: 1,
//       backgroundColor: "rgba(0,0,0,0.5)",
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     modalContent: {
//       backgroundColor: "#fff",
//       borderRadius: 16,
//       padding: 20,
//       width: "90%",
//       maxWidth: 400,
//     },
//     modalTitle: {
//       fontSize: 20,
//       fontWeight: "700",
//       color: "#333",
//       marginBottom: 16,
//     },
//     modalLabel: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: "#333",
//       marginTop: 8,
//     },
//     modalValue: {
//       fontWeight: "400",
//       color: "#666",
//     },
//     itemRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginTop: 8,
//       paddingLeft: 8,
//     },
//     itemText: {
//       fontSize: 14,
//       color: "#333",
//       marginLeft: 8,
//       flex: 1,
//     },
//     modalActions: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       marginTop: 20,
//     },
//     actionButton: {
//       flex: 1,
//       padding: 12,
//       borderRadius: 8,
//       alignItems: "center",
//       marginHorizontal: 4,
//     },
//     failButton: {
//       backgroundColor: "#FF5252",
//     },
//     completeButton: {
//       backgroundColor: "#4A6FE3",
//     },
//     actionButtonText: {
//       color: "#fff",
//       fontSize: 16,
//       fontWeight: "600",
//     },
//     closeModalButton: {
//       marginTop: 12,
//       alignItems: "center",
//     },
//     closeModalText: {
//       fontSize: 16,
//       color: "#4A6FE3",
//       fontWeight: "600",
//     },
//     itemSelectionRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginTop: 12,
//       paddingVertical: 8,
//     },
//     itemName: {
//       fontSize: 14,
//       color: "#333",
//       flex: 1,
//       marginLeft: 8,
//     },
//     evidenceImageBox: {
//       width: 60,
//       height: 60,
//       borderRadius: 8,
//       backgroundColor: "#F6F8FF",
//       justifyContent: "center",
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: "#E0E0E0",
//     },
//     evidencePhoto: {
//       width: 60,
//       height: 60,
//       borderRadius: 8,
//     },
//     modalButton: {
//       backgroundColor: "#4A6FE3",
//       padding: 12,
//       borderRadius: 8,
//       alignItems: "center",
//       marginTop: 20,
//     },
//     modalButtonDisabled: {
//       backgroundColor: "#BDBDBD",
//     },
//     modalButtonText: {
//       color: "#fff",
//       fontSize: 16,
//       fontWeight: "600",
//     },
//     failureInput: {
//       borderWidth: 1,
//       borderColor: "#E0E0E0",
//       borderRadius: 8,
//       padding: 12,
//       marginTop: 8,
//       fontSize: 14,
//       color: "#333",
//       textAlignVertical: "top",
//     },
//     failureOptions: {
//       marginTop: 12,
//     },
//     failureOption: {
//       padding: 10,
//       backgroundColor: "#F6F8FF",
//       borderRadius: 8,
//       marginTop: 8,
//     },
//     failureOptionText: {
//       fontSize: 14,
//       color: "#333",
//     },
//   });

//   export default  styles


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FF" },
  ordersCardContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
    minHeight: 220,
    zIndex: 2,
  },
  ordersHeading: { fontSize: 18, fontWeight: "700", marginBottom: 2, color: "#333" },
  orderCard: {
    backgroundColor: "#F6F8FF",
    borderRadius: 14,
    marginBottom: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "#F6F8FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  orderCardSelected: {
    borderColor: "#4A6FE3",
    backgroundColor: "#F0F4FF",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A6FE3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  donorName: { fontSize: 15, fontWeight: "600", color: "#333" },
  orderTime: { fontSize: 13, color: "#757575" },
  orderAddress: { fontSize: 12, color: "#757575" },
  orderStatus: { fontSize: 12, color: "#10B981", fontWeight: "500" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
    minHeight: 240,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 12 },
  modalLabel: { fontSize: 14, color: "#757575", marginBottom: 8 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginHorizontal: 5,
    marginTop: 10,
  },
  failButton: { backgroundColor: "#FF5252" },
  completeButton: { backgroundColor: "#4CAF50" },
  actionButtonText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  evidenceImageBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F6F8FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  evidencePhoto: { width: 44, height: 44, borderRadius: 8 },
  modalButton: {
    backgroundColor: "#4A6FE3",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  modalButtonDisabled: { backgroundColor: "#BDBDBD" },
  modalButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  failureInput: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  failureOptions: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  failureOption: {
    backgroundColor: "#F0F4FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  failureOptionText: { color: "#4A6FE3", fontSize: 12, fontWeight: "500" },
  reorderButton: {
    flexDirection: "row",
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  reorderButtonText: { color: "#FFFFFF", fontWeight: "600", marginLeft: 8 },
});

export default  styles