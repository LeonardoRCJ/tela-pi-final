import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { AuthContext } from "../context/AuthContext";
import { useTheme, type ThemeColors } from "../context/ThemeContext";
import api from "../services/api";

export type AlbumDetailParams = {
  albumId: number;
  albumTitle?: string;
  classGroupId?: number | null;
};

interface PhotoItem {
  id: number;
  uri: string;
}

function resolvePhotoUri(dto: any): string | null {
  const raw =
    dto?.url ??
    dto?.imageUrl ??
    dto?.fileUrl ??
    dto?.uri ??
    dto?.path ??
    dto?.publicUrl;
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("http")) return raw;
  const base = String(api.defaults.baseURL ?? "").replace(/\/api\/?$/i, "");
  return raw.startsWith("/") ? `${base}${raw}` : `${base}/${raw}`;
}

function mapPhotoDto(raw: any): PhotoItem | null {
  const id = raw?.id;
  if (id == null) return null;
  const uri = resolvePhotoUri(raw);
  if (!uri) return null;
  return { id, uri };
}

export default function AlbumDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params as AlbumDetailParams | undefined;
  const { fs, colors, t, isDark } = useTheme();

  const albumId = params?.albumId;
  const albumTitle = params?.albumTitle ?? t.album;
  const { isMaster } = useContext(AuthContext) as {
    isMaster?: boolean;
  };

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const tileSize = useMemo(() => {
    const w = Dimensions.get("window").width;
    const pad = 18;
    const gap = 10;
    return (w - pad * 2 - gap) / 2;
  }, []);

  const styles = useMemo(
    () => createAlbumDetailStyles(colors, isDark),
    [colors, isDark],
  );

  const loadPhotos = useCallback(async () => {
    if (albumId == null) return;
    try {
      const { data } = await api.get(`/albums/${albumId}/photos`);
      const list = Array.isArray(data) ? data : [];
      const mapped = list
        .map(mapPhotoDto)
        .filter((p): p is PhotoItem => p != null);
      setPhotos(mapped);
    } catch (err: any) {
      console.log(err?.response?.data?.message || err.message);
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2: t.loadPhotosError,
      });
    } finally {
      setLoading(false);
    }
  }, [albumId, t]);

  useFocusEffect(
    useCallback(() => {
      if (albumId == null) {
        setLoading(false);
        return;
      }
      setLoading(true);
      loadPhotos();
    }, [albumId, loadPhotos]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  const pickAndUpload = async () => {
    if (!isMaster || albumId == null) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Toast.show({
        type: "error",
        text1: t.permissionGallery,
        text2: t.permissionGalleryBody,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return;

    const image = result.assets[0];
    const formData = new FormData();
    formData.append(
      "file",
      {
        uri: image.uri,
        name: image.fileName ?? "photo.jpg",
        type: image.mimeType ?? "image/jpeg",
      } as any,
    );

    setUploading(true);
    try {
      await api.post(`/albums/${albumId}/photos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Toast.show({
        type: "success",
        text1: t.sent,
        text2: t.photoAdded,
      });
      await loadPhotos();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2: err?.response?.data?.message || t.uploadPhotoError,
      });
    } finally {
      setUploading(false);
    }
  };

  const confirmDeletePhoto = (photoId: number) => {
    Alert.alert(t.removePhotoTitle, t.removePhotoMessage, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: () => deletePhoto(photoId),
      },
    ]);
  };

  const deletePhoto = async (photoId: number) => {
    try {
      await api.delete(`/albums/photos/${photoId}`);
      Toast.show({
        type: "success",
        text1: t.photoRemovedTitle,
        text2: t.photoRemovedBody,
      });
      loadPhotos();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2: err?.response?.data?.message || t.deletePhotoError,
      });
    }
  };

  const confirmDeleteAlbum = () => {
    if (albumId == null) return;
    Alert.alert(
      t.deleteAlbumTitle,
      t.deleteAlbumConfirmNamed.replace("{name}", albumTitle),
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.delete,
          style: "destructive",
          onPress: () => deleteAlbumById(),
        },
      ],
    );
  };

  const deleteAlbumById = async () => {
    if (albumId == null) return;
    setDeletingAlbum(true);
    try {
      await api.delete(`/albums/${albumId}`);
      Toast.show({
        type: "success",
        text1: t.albumRemovedTitle,
        text2: t.albumRemovedBody,
      });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2: err?.response?.data?.message || t.deleteAlbumError,
      });
    } finally {
      setDeletingAlbum(false);
    }
  };

  const listHeader = (
    <View style={styles.heroOuter}>
      <View style={styles.heroAccent} />
      <View style={styles.heroInner}>
        <Text style={[styles.heroEyebrow, { fontSize: fs(11) }]}>
          {t.galleryHero}
        </Text>
        <Text style={[styles.heroTitle, { fontSize: fs(22) }]} numberOfLines={2}>
          {albumTitle}
        </Text>
        <View style={styles.heroMetaRow}>
          <View style={styles.countPill}>
            <Ionicons name="images-outline" size={15} color={colors.accent} />
            <Text style={[styles.countPillText, { fontSize: fs(13) }]}>
              {photos.length}{" "}
              {photos.length === 1 ? t.photoCount_one : t.photoCount_other}
            </Text>
          </View>
          {isMaster ? (
            <Text style={[styles.hintMaster, { fontSize: fs(11) }]}>
              {t.tapToSendPhoto}
            </Text>
          ) : (
            <Text style={[styles.hintGuest, { fontSize: fs(11) }]}>
              {t.tapToExpand}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderPhoto = ({ item }: { item: PhotoItem }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[styles.photoCard, { width: tileSize, height: tileSize }]}
      onPress={() => setPreviewUri(item.uri)}
      onLongPress={() => {
        if (isMaster) confirmDeletePhoto(item.id);
      }}
      delayLongPress={500}
      accessibilityLabel={t.photo ?? "Ver foto"}
      accessibilityRole="imagebutton"
    >
      <Image source={{ uri: item.uri }} style={styles.photoImage} />
      <View style={styles.photoScrim} pointerEvents="none" />
      <View style={styles.photoHint} pointerEvents="none">
        <View style={styles.expandBadge}>
          <Ionicons name="expand-outline" size={18} color="rgba(255,255,255,0.92)" />
        </View>
      </View>
      {isMaster ? (
        <TouchableOpacity
          style={styles.deleteGlass}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => confirmDeletePhoto(item.id)}
          accessibilityLabel={t.removePhotoTitle ?? "Excluir foto"}
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={17} color={colors.danger} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );

  if (albumId == null) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel={t.back ?? "Voltar"} accessibilityRole="button">
            <Ionicons name="chevron-back" size={22} color={colors.accent} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { fontSize: fs(17) }]}>{t.album}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.muted, { fontSize: fs(15) }]}>{t.invalidAlbum}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel={t.back ?? "Voltar"} accessibilityRole="button">
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { fontSize: fs(15) }]} numberOfLines={1}>
          {t.galleryLabel}
        </Text>
        {isMaster ? (
          <TouchableOpacity
            style={styles.topBarAction}
            onPress={confirmDeleteAlbum}
            disabled={deletingAlbum}
            accessibilityLabel={t.deleteAlbumTitle}
          >
            {deletingAlbum ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <View style={styles.loaderRing}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
          <Text style={[styles.loaderLabel, { fontSize: fs(14) }]}>
            {t.loadingPhotos}
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListHeaderComponent={listHeader}
          renderItem={renderPhoto}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyRing}>
                <View style={styles.emptyInner}>
                  <Ionicons name="images-outline" size={40} color={colors.accent} />
                </View>
              </View>
              <Text style={[styles.emptyTitle, { fontSize: fs(18) }]}>
                {t.noPhotosYet}
              </Text>
              <Text style={[styles.emptySub, { fontSize: fs(13) }]}>
                {isMaster ? t.noPhotosMasterHint : t.noPhotosGuestHint}
              </Text>
            </View>
          )}
        />
      )}

      {isMaster && !loading ? (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
            },
            uploading && styles.fabDisabled,
          ]}
          onPress={pickAndUpload}
          disabled={uploading}
          activeOpacity={0.88}
          accessibilityLabel={t.tapToSendPhoto ?? "Adicionar foto"}
          accessibilityRole="button"
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.accentForeground} />
          ) : (
            <Ionicons name="add" size={32} color={colors.accentForeground} />
          )}
        </TouchableOpacity>
      ) : null}

      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
        statusBarTranslucent
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.modalRoot}>
          <SafeAreaView style={styles.modalSafe} edges={["top", "right", "left"]}>
            <View style={styles.modalBar}>
              <TouchableOpacity
                style={styles.modalClosePill}
                onPress={() => setPreviewUri(null)}
                activeOpacity={0.85}
                accessibilityLabel={t.close ?? "Fechar visualização"}
              >
                <Ionicons name="chevron-down" size={22} color="#FFF" />
                <Text style={[styles.modalCloseText, { fontSize: fs(14) }]}>
                  {t.close}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.modalBarTitle, { fontSize: fs(12) }]} numberOfLines={1}>
                {albumTitle}
              </Text>
              <View style={{ width: 88 }} />
            </View>
          </SafeAreaView>
          <Pressable style={styles.modalBody} onPress={() => setPreviewUri(null)}>
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : null}
          </Pressable>
          <Text style={[styles.modalFooterHint, { fontSize: fs(11) }]}>
            {t.tapOutsideToClose}
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createAlbumDetailStyles(colors: ThemeColors, isDark: boolean) {
  const accentSoft = `${colors.accent}22`;
  const accentBorder = `${colors.accent}45`;
  const countText = isDark ? "#E8D5A3" : colors.accent;
  const topBarActionBg = isDark ? "#1A1212" : colors.card;
  const topBarActionBorder = isDark ? "#2A2020" : colors.cardBorder;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 6,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      justifyContent: "center",
      alignItems: "center",
    },
    topBarAction: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: topBarActionBg,
      borderWidth: 1,
      borderColor: topBarActionBorder,
      justifyContent: "center",
      alignItems: "center",
    },
    topBarTitle: {
      flex: 1,
      textAlign: "center",
      color: colors.textMuted,
      fontWeight: "600",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginHorizontal: 8,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    muted: {
      color: colors.textMuted,
    },
    loaderRing: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    loaderLabel: {
      color: colors.textMuted,
      fontWeight: "500",
    },
    listContent: {
      paddingHorizontal: 18,
      paddingBottom: 120,
      flexGrow: 1,
    },
    heroOuter: {
      marginBottom: 18,
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      flexDirection: "row",
    },
    heroAccent: {
      width: 4,
      backgroundColor: colors.accent,
    },
    heroInner: {
      flex: 1,
      paddingVertical: 20,
      paddingHorizontal: 18,
      paddingLeft: 16,
    },
    heroEyebrow: {
      color: colors.accent,
      fontWeight: "800",
      letterSpacing: 2.2,
      marginBottom: 8,
    },
    heroTitle: {
      color: colors.text,
      fontWeight: "800",
      lineHeight: 28,
      letterSpacing: -0.3,
    },
    heroMetaRow: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
    },
    countPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: accentSoft,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: accentBorder,
    },
    countPillText: {
      color: countText,
      fontWeight: "700",
    },
    hintMaster: {
      color: colors.textMuted,
      flex: 1,
      minWidth: 120,
    },
    hintGuest: {
      color: colors.textMuted,
      flex: 1,
      minWidth: 120,
    },
    gridRow: {
      justifyContent: "space-between",
      marginBottom: 10,
    },
    photoCard: {
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: colors.bgSecondary,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: isDark ? "#000" : "rgba(0,0,0,0.2)",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.35 : 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
    photoImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    photoScrim: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "42%",
      backgroundColor: "rgba(0,0,0,0.42)",
    },
    photoHint: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    expandBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(8,8,8,0.45)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
      justifyContent: "center",
      alignItems: "center",
    },
    deleteGlass: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "rgba(12,12,12,0.72)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      justifyContent: "center",
      alignItems: "center",
    },
    emptyWrap: {
      alignItems: "center",
      paddingHorizontal: 28,
      paddingTop: 28,
      paddingBottom: 48,
    },
    emptyRing: {
      padding: 3,
      borderRadius: 56,
      borderWidth: 1,
      borderColor: accentBorder,
      marginBottom: 22,
    },
    emptyInner: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    emptyTitle: {
      color: colors.text,
      fontWeight: "800",
      textAlign: "center",
    },
    emptySub: {
      color: colors.textMuted,
      marginTop: 10,
      textAlign: "center",
      lineHeight: 21,
      maxWidth: 280,
    },
    fab: {
      position: "absolute",
      right: 22,
      bottom: 28,
      width: 58,
      height: 58,
      borderRadius: 29,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 10,
    },
    fabDisabled: {
      opacity: 0.85,
    },
    modalRoot: {
      flex: 1,
      backgroundColor: "#000",
    },
    modalSafe: {
      backgroundColor: "#0A0A0A",
      borderBottomWidth: 1,
      borderBottomColor: "#1A1A1A",
    },
    modalBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    modalClosePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#222",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#333",
    },
    modalCloseText: {
      color: "#EEE",
      fontWeight: "700",
    },
    modalBarTitle: {
      flex: 1,
      textAlign: "center",
      color: "#666",
      fontWeight: "600",
      marginHorizontal: 8,
    },
    modalBody: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    modalImage: {
      width: "100%",
      height: "100%",
    },
    modalFooterHint: {
      textAlign: "center",
      color: "#444",
      paddingBottom: 20,
      paddingTop: 6,
    },
  });
}
