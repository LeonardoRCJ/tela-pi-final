import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AlbumCoverImage from "../components/AlbumCoverImage";
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

export default function AlbumScreen() {
  const navigation = useNavigation<any>();
  const { colors, fs, t, language } = useTheme();
  const { token } = useContext(AuthContext);

  const [hasGroup, setHasGroup] = useState<boolean>(true);
  const [classGroupId, setClassGroupId] = useState<number | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadAlbums = useCallback(async () => {
    try {
      const groupRes = await api.get("/class-groups/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = groupRes.data;
      let resolvedId: number | null = null;

      if (Array.isArray(data) && data.length > 0) {
        resolvedId = data[0].id;
      } else if (data && data.id) {
        resolvedId = data.id;
      }

      if (!resolvedId) {
        setHasGroup(false);
        setClassGroupId(null);
        setAlbums([]);
        return;
      }

      setHasGroup(true);
      setClassGroupId(resolvedId);

      const albumsRes = await api.get(`/albums/class-group/${resolvedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = Array.isArray(albumsRes.data) ? albumsRes.data : [];
      setAlbums(list.map((raw) => mapAlbumDto(raw, t.untitledAlbum)));
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setHasGroup(false);
        setClassGroupId(null);
        setAlbums([]);
      } else {
        console.log(
          "Erro ao buscar álbuns:",
          err?.response?.data?.message || err.message,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token, language]);

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

  const renderAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={[
        styles.albumCard,
        {
          backgroundColor: colors.card,
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
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.bgSecondary }]}>
        <AlbumCoverImage albumId={item.id} coverPhotoUrl={item.coverPhotoUrl} style={styles.coverImage} />
        <View style={styles.overlay} />
      </View>

      <View style={styles.albumInfo}>
        <Text style={[styles.albumTitle, { color: colors.text, fontSize: fs(16) }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.date ? (
          <Text style={[styles.albumDate, { color: colors.textMuted, fontSize: fs(12) }]}>
            {item.date}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fs(24) }]}>
            {t.albumMuralTitle}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.accent, fontSize: fs(12) }]}>
            {t.albumMuralSubtitle}
          </Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasGroup) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fs(24) }]}>
            {t.albumMuralTitle}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.accent, fontSize: fs(12) }]}>
            {t.albumMuralSubtitle}
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconWrapper,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons name="school-outline" size={52} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text, fontSize: fs(20) }]}>
            {t.albumNoClassTitle}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontSize: fs(14) }]}>
            {t.albumNoClassBody}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: fs(24) }]}>
          {t.albumMuralTitle}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.accent, fontSize: fs(12) }]}>
          {t.albumMuralSubtitle}
        </Text>
      </View>

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
              {t.albumEmptyTitle}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontSize: fs(13), marginTop: 8 }]}>
              {t.albumEmptyBody}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: "900",
  },
  headerSubtitle: {
    letterSpacing: 0.5,
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
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
  },
  emptyTitle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
});
