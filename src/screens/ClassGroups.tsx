import { Ionicons } from "@expo/vector-icons";
import {
    CommonActions,
    useNavigation,
} from "@react-navigation/native";
import React, {
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";

import { ThemeContext } from "../context/ThemeContext";
import { SimpleClassGroup } from "../interfaces/classgroup";
import api from "../services/api";

export default function ClassGroups() {
  const navigation = useNavigation<any>();

  const {
    colors,
    fs,
    t,
  } = useContext(ThemeContext);

  const [classGroups, setClassGroups] =
    useState<SimpleClassGroup[]>([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [name, setName] = useState("");

  // DELETE CONFIRM
  const [deleteVisible, setDeleteVisible] =
    useState(false);

  const [selectedDelete, setSelectedDelete] =
    useState<SimpleClassGroup | null>(
      null,
    );

  // QR MODAL
  const [qrVisible, setQrVisible] =
    useState(false);

  const [selectedQr, setSelectedQr] =
    useState<SimpleClassGroup | null>(
      null,
    );

  async function getClassGroups() {
    try {
      const response = await api.get("/class-groups");

      setClassGroups(response.data);
    } catch(error:any) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    }
  }

  useEffect(() => {
    getClassGroups();
  }, []);

  const onRefresh = useCallback(
    async () => {
      setRefreshing(true);
      await getClassGroups();
      setRefreshing(false);
    },
    [],
  );

  function openCreate() {
    setEditingId(null);
    setName("");
    setModalVisible(true);
  }

  function openEdit(
    item: SimpleClassGroup,
  ) {
    setEditingId(item.id!);
    setName(item.name);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setName("");
    setEditingId(null);
  }

  function openDelete(
    item: SimpleClassGroup,
  ) {
    setSelectedDelete(item);
    setDeleteVisible(true);
  }

  function openQr(
    item: SimpleClassGroup,
  ) {
    setSelectedQr(item);
    setQrVisible(true);
  }

  async function save() {
    try {
      if (!name.trim()) return;

      if (editingId) {
        await api.patch(
          `/class-groups/${editingId}`,
          null,
          {
            params: { name },
          },
        );

        Toast.show({
          type: "success",
          text1: t.classUpdated,
        });
      } else {
        await api.post(
          "/class-groups",
          {
            name,
          },
        );

        Toast.show({
          type: "success",
          text1: t.classCreated,
        });
      }

      closeModal();
      getClassGroups();
    } catch {
      Toast.show({
        type: "error",
        text1: t.saveClassError,
      });
    }
  }

  async function remove(id: number) {
    try {
      await api.delete(
        `/class-groups/${id}`,
      );

      Toast.show({
        type: "success",
        text1: t.classRemoved,
      });

      setDeleteVisible(false);
      getClassGroups();
    } catch {
      Toast.show({
        type: "error",
        text1: t.removeClassError,
      });
    }
  }

  function renderItem({
    item,
  }: {
    item: SimpleClassGroup;
  }) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.card,
          {
            backgroundColor:
              colors.card,
            borderColor:
              colors.cardBorder,
          },
        ]}
        onPress={() =>
          navigation.dispatch(
            CommonActions.navigate(
              "DetalheTurma",
              {
                classGroupId:
                  item.id,
                classGroupName:
                  item.name,
                qrToken:
                  item.qrToken,
              },
            ),
          )
        }
        accessibilityLabel={`${t.myClasses}: ${item.name}`}
        accessibilityRole="button"
      >
        <View style={styles.row}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor:
                  colors.accent +
                  "20",
              },
            ]}
          >
            <Ionicons
              name="people"
              size={20}
              color={
                colors.accent
              }
            />
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={[
                styles.name,
                {
                  color:
                    colors.text,
                  fontSize:
                    fs(17),
                },
              ]}
            >
              {item.name}
            </Text>

            <Text
              style={{
                color:
                  colors.textMuted,
                fontSize:
                  fs(13),
                marginTop: 3,
              }}
            >
              {
                item.countPractitioners
              }{" "}
              {t.studentsCountSuffix}
            </Text>
          </View>

          {/* QR */}
          <TouchableOpacity
            style={
              styles.actionBtn
            }
            onPress={() =>
              openQr(item)
            }
            accessibilityLabel={`${t.qrCode ?? "QR Code"} ${item.name}`}
            accessibilityRole="button"
          >
            <Ionicons
              name="qr-code-outline"
              size={20}
              color={
                colors.accent
              }
            />
          </TouchableOpacity>

          {/* EDIT */}
          <TouchableOpacity
            style={
              styles.actionBtn
            }
            onPress={() =>
              openEdit(item)
            }
            accessibilityLabel={`${t.editClass ?? "Editar"} ${item.name}`}
            accessibilityRole="button"
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={
                colors.accent
              }
            />
          </TouchableOpacity>

          {/* DELETE */}
          <TouchableOpacity
            style={
              styles.actionBtn
            }
            onPress={() =>
              openDelete(item)
            }
            accessibilityLabel={`${t.deleteClass ?? "Excluir"} ${item.name}`}
            accessibilityRole="button"
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={
                colors.danger
              }
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.bg,
        },
      ]}
    >
      {/* HEADER */}
      <View
        style={
          styles.header
        }
      >
        <View>
          <Text
            style={[
              styles.title,
              {
                color:
                  colors.text,
                fontSize:
                  fs(28),
              },
            ]}
          >
            {t.myClasses}
          </Text>

          <Text
            style={{
              color:
                colors.textMuted,
              fontSize:
                fs(13),
              marginTop: 4,
            }}
          >
            {classGroups.length} {t.activeClassesCount}
          </Text>
        </View>
      </View>

      {/* LISTA */}
      <FlatList
        data={classGroups}
        keyExtractor={(
          item,
        ) =>
          item.id!.toString()
        }
        renderItem={
          renderItem
        }
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor:
              colors.accent,
          },
        ]}
        onPress={openCreate}
        accessibilityLabel={t.newClass ?? "Nova turma"}
        accessibilityRole="button"
      >
        <Ionicons
          name="add"
          size={28}
          color={
            colors.accentForeground
          }
        />
      </TouchableOpacity>

      {/* CREATE / EDIT */}
      <Modal
        transparent
        visible={
          modalVisible
        }
        animationType="slide"
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : undefined
          }
          style={
            styles.overlay
          }
        >
          <View
            style={[
              styles.modal,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >
            <Text
              style={{
                color:
                  colors.text,
                fontSize:
                  fs(22),
                fontWeight:
                  "800",
                marginBottom: 18,
              }}
            >
              {editingId ? t.editClass : t.newClass}
            </Text>

            <TextInput
              placeholder={t.classNamePlaceholder}
              placeholderTextColor={
                colors.textMuted
              }
              value={name}
              onChangeText={
                setName
              }
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.inputBg,
                  color:
                    colors.text,
                },
              ]}
              accessibilityLabel={t.classNamePlaceholder ?? "Nome da turma"}
            />

            <View
              style={
                styles.modalActions
              }
            >
              <TouchableOpacity
                onPress={
                  closeModal
                }
                accessibilityLabel={t.cancel}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color:
                      colors.textMuted,
                    fontWeight:
                      "700",
                  }}
                >
                  {t.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor:
                      colors.accent,
                  },
                ]}
                onPress={save}
                accessibilityLabel={t.save ?? "Salvar"}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color:
                      colors.accentForeground,
                    fontWeight:
                      "900",
                  }}
                >
                  {t.save}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        transparent
        visible={
          deleteVisible
        }
        animationType="fade"
      >
        <View
          style={
            styles.centerOverlay
          }
        >
          <View
            style={[
              styles.confirmBox,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={38}
              color={
                colors.danger
              }
            />

            <Text
              style={{
                color:
                  colors.text,
                fontSize:
                  fs(20),
                fontWeight:
                  "800",
                marginTop: 12,
              }}
            >
              {t.deleteClassQuestion}
            </Text>

            <Text
              style={{
                color:
                  colors.textMuted,
                textAlign:
                  "center",
                marginTop: 10,
              }}
            >
              {t.deleteClassRemoveNamed.replace(
                "{name}",
                selectedDelete?.name ?? "",
              )}
            </Text>

            <View
              style={{
                flexDirection:
                  "row",
                gap: 10,
                marginTop: 22,
              }}
            >
              <TouchableOpacity
                style={
                  styles.cancelBtn
                }
                onPress={() =>
                  setDeleteVisible(
                    false,
                  )
                }
                accessibilityLabel={t.cancel}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color:
                      colors.textMuted,
                    fontWeight:
                      "700",
                  }}
                >
                  {t.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteBtn,
                  {
                    backgroundColor:
                      colors.danger,
                  },
                ]}
                onPress={() =>
                  remove(
                    selectedDelete?.id!,
                  )
                }
                accessibilityLabel={`${t.delete ?? "Excluir"} ${selectedDelete?.name ?? ""}`}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color:
                      colors.text,
                    fontWeight:
                      "900",
                  }}
                >
                  {t.delete}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR MODAL */}
      <Modal
        transparent
        visible={
          qrVisible
        }
        animationType="fade"
      >
        <View
          style={
            styles.centerOverlay
          }
        >
          <View
            style={[
              styles.qrBox,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >
            <Text
              style={{
                color:
                  colors.text,
                fontSize:
                  fs(20),
                fontWeight:
                  "800",
                marginBottom: 18,
              }}
            >
              {selectedQr?.name}
            </Text>

            <QRCode
              value={
                selectedQr?.qrToken ||
                ""
              }
              size={230}
            />

            <TouchableOpacity
              style={[
                styles.closeQrBtn,
                {
                  backgroundColor:
                    colors.accent,
                },
              ]}
              onPress={() =>
                setQrVisible(
                  false,
                )
              }
              accessibilityLabel={t.close ?? "Fechar"}
              accessibilityRole="button"
            >
              <Text
                style={{
                  color:
                    colors.accentForeground,
                  fontWeight:
                    "900",
                  alignItems: 'center'
                }}
              >
                {t.close}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    header: {
      paddingHorizontal: 22,
      paddingTop: 60,
      paddingBottom: 10,
    },

    title: {
      fontWeight: "900",
    },

    card: {
      borderWidth: 1,
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
    },

    row: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 14,
    },

    name: {
      fontWeight: "800",
    },

    actionBtn: {
      padding: 8,
      marginLeft: 4,
    },

    fab: {
      position:
        "absolute",
      right: 24,
      bottom: 28,
      width: 62,
      height: 62,
      borderRadius: 999,
      justifyContent:
        "center",
      alignItems:
        "center",
      elevation: 8,
    },

    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.6)",
      justifyContent:
        "flex-end",
    },

    centerOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.7)",
      justifyContent:
        "center",
      alignItems:
        "center",
      padding: 20,
    },

    modal: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
    },

    input: {
      height: 56,
      borderRadius: 16,
      paddingHorizontal: 16,
      marginBottom: 18,
    },

    modalActions: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    saveBtn: {
      paddingHorizontal: 22,
      paddingVertical: 14,
      borderRadius: 14,
    },

    confirmBox: {
      width: "100%",
      borderRadius: 24,
      padding: 24,
      alignItems:
        "center",
    },

    cancelBtn: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#333",
    },

    deleteBtn: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 14,
    },

    qrBox: {
      width: "100%",
      borderRadius: 24,
      padding: 24,
      alignItems:
        "center",
    },

    closeQrBtn: {
      marginTop: 22,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 14,
    },
  });