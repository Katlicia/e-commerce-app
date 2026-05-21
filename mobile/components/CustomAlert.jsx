import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";

export default function CustomAlert({ visible, title, message, buttons, onDismiss }) {
  const resolvedButtons =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: "Tamam", style: "default" }];

  function handlePress(btn) {
    btn.onPress?.();
    onDismiss?.();
  }

  function getTextColor(style) {
    if (style === "destructive") return "#F83B0A";
    if (style === "cancel") return "#6c757d";
    return "#ff7700";
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 40,
        }}
        onPress={onDismiss}
      >
        <Pressable
          style={{
            backgroundColor: "white",
            borderRadius: 14,
            width: "100%",
            overflow: "hidden",
          }}
          onPress={() => {}}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 22,
              paddingBottom: 18,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#212529",
                textAlign: "center",
                marginBottom: message ? 8 : 0,
              }}
            >
              {title}
            </Text>
            {message ? (
              <Text
                style={{
                  fontSize: 14,
                  color: "#6c757d",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {message}
              </Text>
            ) : null}
          </View>

          <View style={{ height: 1, backgroundColor: "#f0f0f0" }} />

          <View style={{ flexDirection: "row" }}>
            {resolvedButtons.map((btn, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <View style={{ width: 1, backgroundColor: "#f0f0f0" }} />
                )}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: btn.style === "cancel" ? "400" : "600",
                      color: getTextColor(btn.style),
                    }}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
