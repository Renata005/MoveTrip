import { useEffect, useState } from "react";
import {
  View, Text, FlatList, ActivityIndicator, TouchableOpacity,
  Image, StyleSheet, ScrollView, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAllCountries } from "../services/countriesApi";

const destaques = [
  { pais: "Brasil", cidade: "Rio de Janeiro", flagUri: "https://flagcdn.com/w320/br.png", imgUri: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800" },
  { pais: "França", cidade: "Paris", flagUri: "https://flagcdn.com/w320/fr.png", imgUri: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800" },
  { pais: "Japão", cidade: "Tóquio", flagUri: "https://flagcdn.com/w320/jp.png", imgUri: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800" },
];

const countryImages = {
  Brasil: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800",
  França: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800",
  Japão: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800",
  Itália: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800",
};

function LogoHeader() {
  return (
    <View style={logoStyles.wrap}>
      <Image
        source={require("../../assets/logo.png")}
        style={logoStyles.img}
        resizeMode="contain"
      />
    </View>
  );
}

const logoStyles = StyleSheet.create({
  wrap: {
    width: 180,
    height: 80,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  img: {
    width: "100%",
    height: "100%",
  },
});

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    async function loadCountries() {
      try {
        const data = await getAllCountries();
        data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(data);
      } catch (error) {
        console.log("ERRO:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCountries();
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.common.toLowerCase().includes(search.toLowerCase())
  );

  const showSearchResults = search.length > 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2493FF" />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top || 16 }]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 65 + insets.bottom + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <LogoHeader />
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=32" }}
            style={styles.avatar}
          />
        </View>

        {/* Hero — some quando busca está ativa */}
        {!showSearchResults && (
          <View style={styles.hero}>
            <Image
              source={require("../../assets/globe.png")}
              style={styles.heroImage}
            />
            <Text style={styles.title}>Explorar</Text>
            <Text style={styles.subtitle}>
              Descubra destinos incríveis{"\n"}e monte sua próxima aventura ✈️
            </Text>
          </View>
        )}

        {/* Search */}
        <View style={[styles.searchContainer, searchFocused && styles.searchFocused]}>
          <Ionicons name="search" size={20} color={searchFocused ? "#2493FF" : "#999"} />
          <TextInput
            placeholder="Buscar país ou cidade"
            placeholderTextColor="#BBB"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#BBB" />
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados de busca */}
        {showSearchResults && (
          <View>
            <Text style={styles.searchResultLabel}>
              {filteredCountries.length} resultado{filteredCountries.length !== 1 ? "s" : ""} para "{search}"
            </Text>
            {filteredCountries.slice(0, 20).map((item) => (
              <TouchableOpacity
                key={item.cca2}
                style={styles.countryCard}
                onPress={() => navigation.navigate("CountryDetail", { country: item })}
              >
                <Image source={{ uri: item.flags.png }} style={styles.flag} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name.common}</Text>
                  <Text style={styles.capital}>📍 {item.capital?.[0]}</Text>
                  <View style={styles.cityBadge}>
                    <Text style={styles.cityText}>1 cidade</Text>
                  </View>
                </View>
                <Image
                  source={{ uri: countryImages[item.name.common] || "https://picsum.photos/seed/" + item.cca2 + "/200" }}
                  style={styles.countryPhoto}
                />
                <Ionicons name="chevron-forward" size={24} color="#CCC" />
              </TouchableOpacity>
            ))}
            {filteredCountries.length === 0 && (
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={40} color="#CCC" />
                <Text style={styles.emptySearchText}>Nenhum resultado encontrado</Text>
              </View>
            )}
          </View>
        )}

        {/* Conteúdo normal */}
        {!showSearchResults && (
          <>
            <Text style={styles.section}>Destinos em destaque</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30 }}>
              {destaques.map((d, i) => (
                <TouchableOpacity key={i} style={styles.highlightCard}>
                  <Image source={{ uri: d.imgUri }} style={styles.highlightImage} />
                  <View style={styles.overlay}>
                    <View style={styles.topIcons}>
                      <Image source={{ uri: d.flagUri }} style={styles.smallFlag} />
                      <View style={styles.heartButton}>
                        <Ionicons name="heart-outline" size={22} color="#FFF" />
                      </View>
                    </View>
                    <View style={styles.bottomInfo}>
                      <Text style={styles.highlightTitle}>{d.pais}</Text>
                      <Text style={styles.highlightSubtitle}>{d.cidade}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.section}>Explorar países</Text>
            <FlatList
              data={countries.slice(0, 20)}
              keyExtractor={(item) => item.cca2}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryCard}
                  onPress={() => navigation.navigate("CountryDetail", { country: item })}
                >
                  <Image source={{ uri: item.flags.png }} style={styles.flag} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name.common}</Text>
                    <Text style={styles.capital}>📍 {item.capital?.[0]}</Text>
                    <View style={styles.cityBadge}>
                      <Text style={styles.cityText}>1 cidade</Text>
                    </View>
                  </View>
                  <Image
                    source={{ uri: countryImages[item.name.common] || "https://picsum.photos/seed/" + item.cca2 + "/200" }}
                    style={styles.countryPhoto}
                  />
                  <Ionicons name="chevron-forward" size={24} color="#CCC" />
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F7F9FC" },
  container: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  avatar: { width: 50, height: 50, borderRadius: 25 },

  hero: { height: 180, justifyContent: "center", position: "relative", marginTop: 4 },
  heroImage: { position: "absolute", right: -40, top: 10, width: 300, height: 210, opacity: 0.38 },
  title: { fontSize: 52, fontWeight: "bold", color: "#081E5B" },
  subtitle: { color: "#666", fontSize: 17, marginTop: 8, lineHeight: 24 },

  searchContainer: { backgroundColor: "#FFF", borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 24, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, borderWidth: 1.5, borderColor: "transparent" },
  searchFocused: { borderColor: "#2493FF" },
  input: { marginLeft: 10, flex: 1, fontSize: 15, color: "#333" },

  searchResultLabel: { fontSize: 14, color: "#888", marginBottom: 16 },
  emptySearch: { alignItems: "center", paddingVertical: 40 },
  emptySearchText: { color: "#BBB", fontSize: 15, marginTop: 12 },

  section: { fontSize: 24, fontWeight: "bold", color: "#0B1E4F", marginBottom: 16 },

  highlightCard: { width: 210, height: 310, borderRadius: 28, marginRight: 18, overflow: "hidden", elevation: 5 },
  highlightImage: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: { position: "absolute", width: "100%", height: "100%", justifyContent: "space-between", padding: 16 },
  topIcons: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  smallFlag: { width: 38, height: 24, borderRadius: 4 },
  heartButton: { backgroundColor: "rgba(255,255,255,0.25)", width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  bottomInfo: { marginBottom: 8 },
  highlightTitle: { color: "#FFF", fontSize: 22, fontWeight: "bold", textShadowColor: "rgba(0,0,0,0.7)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  highlightSubtitle: { color: "#FFF", fontSize: 15, marginTop: 3, textShadowColor: "rgba(0,0,0,0.7)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },

  countryCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
  flag: { width: 56, height: 38, borderRadius: 6, marginRight: 14 },
  name: { fontSize: 20, fontWeight: "bold", color: "#081E5B" },
  capital: { color: "#888", fontSize: 14, marginTop: 3 },
  cityBadge: { backgroundColor: "#DFF0FF", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start", marginTop: 10 },
  cityText: { color: "#2493FF", fontWeight: "bold", fontSize: 13 },
  countryPhoto: { width: 90, height: 90, borderRadius: 20, marginRight: 10 },
});