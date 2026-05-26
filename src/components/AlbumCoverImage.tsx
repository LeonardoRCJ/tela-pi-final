import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";

/** Capas padrão (treino / dojo / equipe) — variam por álbum quando não há `coverPhotoUrl`. */
const DEFAULT_COVER_URLS = [
  "https://images.unsplash.com/photo-1549719386-74dfcbf7a31e?w=720&h=480&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574689045370-b2b8c0a67b36?w=720&h=480&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=720&h=480&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599058945522-81bac39f0a66?w=720&h=480&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=720&h=480&fit=crop&q=80",
];

export function defaultAlbumCoverUrl(albumId: number): string {
  const idx = Math.abs(Number(albumId)) % DEFAULT_COVER_URLS.length;
  return DEFAULT_COVER_URLS[idx];
}

type Props = {
  albumId: number;
  coverPhotoUrl?: string | null;
  style?: ViewStyle;
};

/**
 * Capa do álbum: usa `coverPhotoUrl` quando existir; senão uma imagem temática.
 * Se a URL da API falhar, tenta a capa padrão; se ainda falhar, mostra arte local.
 */
export default function AlbumCoverImage({ albumId, coverPhotoUrl, style }: Props) {
  const custom = coverPhotoUrl?.trim() ?? "";
  const fallbackUrl = defaultAlbumCoverUrl(albumId);

  const [mode, setMode] = useState<"custom" | "default" | "art">(() =>
    custom ? "custom" : "default",
  );
  const [uri, setUri] = useState(() => (custom ? custom : fallbackUrl));

  useEffect(() => {
    if (custom) {
      setMode("custom");
      setUri(custom);
    } else {
      setMode("default");
      setUri(fallbackUrl);
    }
  }, [custom, fallbackUrl]);

  const onError = () => {
    if (mode === "custom") {
      setMode("default");
      setUri(fallbackUrl);
      return;
    }
    setMode("art");
  };

  if (mode === "art") {
    return (
      <View style={[styles.artRoot, style]}>
        <View style={styles.artGlow} />
        <View style={styles.artBand} />
        <View style={styles.artRing}>
          <Ionicons name="images" size={36} color="rgba(212, 175, 55, 0.85)" />
        </View>
        <View style={styles.artShine} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image]}
      resizeMode="cover"
      onError={onError}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  artRoot: {
    width: "100%",
    height: "100%",
    backgroundColor: "#12100e",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  artGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(212, 175, 55, 0.07)",
  },
  artBand: {
    position: "absolute",
    width: "140%",
    height: 48,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    transform: [{ rotate: "-12deg" }],
    top: "38%",
  },
  artRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(18, 16, 14, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  artShine: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
});
