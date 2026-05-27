import { Ionicons } from "@expo/vector-icons";
import {
    CommonActions,
    useFocusEffect,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import React, { useCallback, useContext, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import AlbumCoverImage from "../components/AlbumCoverImage";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

interface Album {
  id: number;
  title: string;
  description?: string;
  coverPhotoUrl?: string;
  date?: string;
}

function mapAlbumDto(raw: any, untitled: string): Album {
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? untitled,
    description: raw.description,
    coverPhotoUrl:
      raw.coverPhotoUrl ?? raw.coverUrl ?? raw.thumbnailUrl ?? raw.firstPhotoUrl,
    date: raw.date,
  };
}

export default function MasterAlbumsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classGroupId, classGroupName } = route.params;
  const { colors, fs, t, language } = useTheme();
  const { isMaster } = useContext(AuthContext) as {
    isMaster?: boolean;
  };

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingAlbumId, setDeletingAlbumId] = useState<number | null>(null);

  const loadAlbums = useCallback(async () => {
    try {
      const { data } = await api.get(`/albums/class-group/${classGroupId}`);
      const list = Array.isArray(data) ? data : [];
      setAlbums(list.map((raw) => mapAlbumDto(raw, t.untitledAlbum)));
    } catch (err: any) {
      console.log("Erro ao buscar álbuns:", err?.response?.data?.message || err.message);
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2: t.loadAlbumsError,
      });
    } finally {
      setLoading(false);
    }
  }, [classGroupId, language]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAlbums();
    }, [loadAlbums]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlbums();
    setRefreshing(false);
  };

  const handleCreateAlbum = async () => {
    if (!albumTitle.trim()) {
      Toast.show({
        type: "error",
        text1: t.toastWarning,
        text2: t.albumTitleRequired,
      });
      return;
    }

    setCreating(true);
    try {
      await api.post(
        `/albums`,
        { name: albumTitle.trim(), classGroupId },
      );

      Toast.show({
        type: "success",
        text1: t.toastSuccess,
        text2: t.albumCreated,
      });

      closeModal();
      loadAlbums();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2: err?.response?.data?.message || t.albumCreateError,
      });
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setAlbumTitle("");
  };

  const confirmDeleteAlbum = (item: Album) => {
    Alert.alert(t.deleteAlbumTitle, t.deleteAlbumConfirmNamed.replace("{name}", item.title), [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: () => deleteAlbumById(item.id),
      },
    ]);
  };

  const deleteAlbumById = async (id: number) => {
    setDeletingAlbumId(id);
    try {
      await api.delete(`/albums/${id}`);
      Toast.show({
        type: "success",
        text1: t.albumRemovedTitle,
        text2: t.albumRemovedList,
      });
      loadAlbums();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2: err?.response?.data?.message || t.deleteAlbumError,
      });
    } finally {
      setDeletingAlbumId(null);
    }
  };

  const renderAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={[
        styles.albumCard,
        {
          backgroundColor: colors.bgSecondary,
          borderColor: colors.cardBorder,
        },
      ]}
      activeOpacity={0.8}
      onPress={() =>
        navigation.dispatch(
          CommonActions.navigate({
            name: "AlbumDetail",
            params: {
              albumId: item.id,
              albumTitle: item.title,
              classGroupId,
            },
          }),
        )
      }
      accessibilityLabel={`${t.album ?? "Álbum"}: ${item.title}`}
      accessibilityRole="button"
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.bg }]}>
        <AlbumCoverImage albumId={item.id} coverPhotoUrl={item.coverPhotoUrl} style={styles.coverImage} />
        <View style={styles.overlay} />
        {isMaster ? (
          <TouchableOpacity
            style={styles.albumDeleteFab}
            onPress={() => confirmDeleteAlbum(item)}
            disabled={deletingAlbumId === item.id}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel={`${t.deleteAlbumTitle ?? "Excluir álbum"} ${item.title}`}
            accessibilityRole="button"
          >
            {deletingAlbumId === item.id ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.albumInfo}>
        <Text style={[styles.albumTitle, { color: colors.text, fontSize: fs(16) }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.date ? (
          <Text style={[styles.albumDate, { color: colors.textMuted, fontSize: fs(12) }]}>{item.date}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel={t.back ?? "Voltar"}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { color: colors.text, fontSize: fs(17) }]}>{classGroupName}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fs(12) }]}>
            {t.masterAlbumsSubtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={() => setModalVisible(true)}
          accessibilityLabel={t.newAlbum ?? "Novo álbum"}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color={colors.accentForeground} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : `album-${index}`)}
          renderItem={renderAlbum}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={54} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text, fontSize: fs(18), marginTop: 16 }]}>
                {t.noAlbumsYet}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontSize: fs(13), marginTop: 8 }]}>
                {t.noAlbumsMasterHint}
              </Text>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.modal,
              { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.newAlbum}</Text>

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t.albumTitleLabel}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                },
              ]}
              placeholder={t.albumTitlePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={albumTitle}
              onChangeText={setAlbumTitle}
              accessibilityLabel={t.albumTitleLabel ?? "Título do álbum"}
            />

            <View style={styles.modalRow}>
              <Pressable
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                ]}
                onPress={closeModal}
                disabled={creating}
                accessibilityLabel={t.cancel}
                accessibilityRole="button"
              >
                <Text style={[styles.cancelText, { color: colors.textMuted }]}>{t.cancel}</Text>
              </Pressable>

              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                onPress={handleCreateAlbum}
                disabled={creating}
                accessibilityLabel={t.create ?? "Criar álbum"}
                accessibilityRole="button"
              >
                {creating ? (
                  <ActivityIndicator color={colors.accentForeground} />
                ) : (
                  <Text style={[styles.saveText, { color: colors.accentForeground }]}>{t.create}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  albumCard: {
    width: "48%",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  albumDeleteFab: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(10,10,10,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  albumInfo: {
    padding: 12,
  },
  albumTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  albumDate: {},
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyTitle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    padding: 22,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  modalRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  saveBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontWeight: "700",
  },
  saveText: {
    fontWeight: "900",
  },
});
