import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  sessionDate: string;
  onSuccess?: () => void;
}

export default function CreateVisitantModal({
  visible,
  onClose,
  sessionDate,
  onSuccess,
}: Props) {
  const { colors, fs } = useTheme();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);

  function normalizeDate(date: any) {
    if (Array.isArray(date)) {
      const [y, m, d] = date;

      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }

    return date;
  }

  async function handleCreate() {
    try {
      if (!name || !phone) {
        Toast.show({
          type: "error",
          text1: "Campos obrigatórios",
          text2: "Preencha nome e telefone.",
        });

        return;
      }

      setLoading(true);

      await api.post("/visitants", {
        name,
        phone,
        sessionDate: normalizeDate(sessionDate),
      });

      Toast.show({
        type: "success",
        text1: "Visitante criado",
        text2: "Visitante cadastrado com sucesso.",
      });

      setName("");
      setPhone("");

      onClose();

      onSuccess?.();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2:
          err?.response?.data?.message ||
          "Não foi possível criar visitante.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    fontSize: fs(18),
                  },
                ]}
              >
                Novo Visitante
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textMuted,
                    fontSize: fs(12),
                  },
                ]}
              >
                Vinculado à sessão atual
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.accent}
            />

            <TextInput
              placeholder="Nome do visitante"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                {
                  color: colors.text,
                  fontSize: fs(14),
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="call-outline"
              size={20}
              color={colors.accent}
            />

            <TextInput
              placeholder="Telefone"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={[
                styles.input,
                {
                  color: colors.text,
                  fontSize: fs(14),
                },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.accent,
              },
            ]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.accentForeground} />
            ) : (
              <>
                <Ionicons
                  name="person-add"
                  size={20}
                  color={colors.accentForeground}
                />

                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: colors.accentForeground,
                      fontSize: fs(14),
                    },
                  ]}
                >
                  CADASTRAR
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modal: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 4,
  },

  inputWrap: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    marginLeft: 12,
  },

  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  buttonText: {
    fontWeight: "900",
    letterSpacing: 1,
  },
});