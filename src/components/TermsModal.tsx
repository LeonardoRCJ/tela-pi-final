import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  /** Se true exibe o botão "Aceitar e continuar"; útil na tela de cadastro */
  showAcceptButton?: boolean;
}

type TabType = "terms" | "privacy";

export default function TermsModal({
  visible,
  onClose,
  onAccept,
  showAcceptButton = false,
}: TermsModalProps) {
  const { colors, fs, t } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("terms");

  const getContent = () => {
    if (activeTab === "terms") {
      return t.termsBody;
    } else {
      return t.privacyBody;
    }
  };

  const getTitle = () => {
    if (activeTab === "terms") {
      return t.termsModalTitle;
    } else {
      return t.privacyModalTitle;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder },
          ]}
        >
          {/* Header */}
          <View
            style={[styles.header, { borderBottomColor: colors.cardBorder }]}
          >
            <Text
              style={[styles.title, { color: colors.text, fontSize: fs(18) }]}
              accessibilityRole="header"
            >
              {getTitle()}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.card }]}
              accessibilityLabel={t.termsModalClose}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View
            style={[styles.tabsContainer, { borderBottomColor: colors.cardBorder }]}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  borderBottomColor:
                    activeTab === "terms" ? colors.accent : "transparent",
                  borderBottomWidth: activeTab === "terms" ? 2 : 0,
                },
              ]}
              onPress={() => setActiveTab("terms")}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "terms" }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === "terms" ? colors.accent : colors.textMuted,
                    fontSize: fs(14),
                  },
                ]}
              >
                {t.termsLinkLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                {
                  borderBottomColor:
                    activeTab === "privacy" ? colors.accent : "transparent",
                  borderBottomWidth: activeTab === "privacy" ? 2 : 0,
                },
              ]}
              onPress={() => setActiveTab("privacy")}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "privacy" }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "privacy" ? colors.accent : colors.textMuted,
                    fontSize: fs(14),
                  },
                ]}
              >
                {t.privacyLinkLabel}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            accessibilityLabel={getTitle()}
          >
            <Text
              style={[styles.body, { color: colors.text, fontSize: fs(14) }]}
            >
              {getContent()}
            </Text>
          </ScrollView>

          {/* Footer */}
          <View
            style={[styles.footer, { borderTopColor: colors.cardBorder }]}
          >
            {showAcceptButton && onAccept ? (
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  onAccept();
                  onClose();
                }}
                accessibilityLabel={t.termsModalAccept}
                accessibilityRole="button"
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={colors.accentForeground}
                />
                <Text
                  style={[
                    styles.acceptBtnText,
                    { color: colors.accentForeground, fontSize: fs(15) },
                  ]}
                >
                  {t.termsModalAccept}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: colors.accent }]}
                onPress={onClose}
                accessibilityLabel={t.termsModalClose}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.acceptBtnText,
                    { color: colors.accentForeground, fontSize: fs(15) },
                  ]}
                >
                  {t.termsModalClose}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "85%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: "800",
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: "600",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  body: {
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  acceptBtnText: {
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});