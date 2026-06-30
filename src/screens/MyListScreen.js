import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View, Text, FlatList, Image, StyleSheet,
  ActivityIndicator, TouchableOpacity, ScrollView, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

function exibirOrcamento(valor) {
  if (!valor) return "0";
  const num = parseFloat(String(valor));
  if (isNaN(num)) return String(valor);
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const ABAS = ["Desejo", "Planejados", "Concluídos"];
const STATUS_MAP = { Desejo: "Desejo", Planejados: "Planejado", Concluídos: "Visitado" };

// Logo reutilizável (mesma lógica do ExploreScreen)
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
  wrap: { width: 240, height: 84, justifyContent: "center", alignItems: "flex-start" },
  img: { width: "100%", height: "100%" },
});

export default function MyListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaSelecionada, setAbaSelecionada] = useState("Desejo");
  const isFocused = useIsFocused();

  useEffect(() => { loadTrips(); }, [isFocused]);

  async function loadTrips() {
    try {
      const querySnapshot = await getDocs(collection(db, "trips"));
      const lista = [];
      querySnapshot.forEach((d) => lista.push({ id: d.id, ...d.data() }));
      setTrips(lista);
    } catch (error) { console.log(error); }
    finally { setLoading(false); }
  }

  async function deleteTrip(id) {
    Alert.alert("Remover destino", "Tem certeza que deseja remover?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive", onPress: async () => {
          try {
            await deleteDoc(doc(db, "trips", id));
            setTrips((prev) => prev.filter((t) => t.id !== id));
          } catch (error) { console.log(error); }
        }
      }
    ]);
  }

  async function toggleDestaque(item) {
    const novoValor = !item.destaque;
    try {
      await updateDoc(doc(db, "trips", item.id), { destaque: novoValor });
      setTrips((prev) =>
        prev.map((t) => t.id === item.id ? { ...t, destaque: novoValor } : t)
      );
    } catch (error) { console.log(error); }
  }

  const visitado = trips.filter((t) => t.status === "Visitado");
  const desejo = trips.filter((t) => t.status === "Desejo");
  const listaAtual = trips.filter((t) => t.status === STATUS_MAP[abaSelecionada]);

  function renderCard(item) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("TripDetails", { trip: item })}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item.imagem || "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800" }}
            style={styles.tripImage}
          />
          {item.bandeira ? (
            <Image source={{ uri: item.bandeira }} style={styles.flagOverlay} />
          ) : null}
          <TouchableOpacity style={styles.heartBtn} onPress={() => toggleDestaque(item)}>
            <Ionicons
              name={item.destaque ? "heart" : "heart-outline"}
              size={20}
              color={item.destaque ? "#FF4B6E" : "#FFF"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.nome}>{item.nome}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.rating}> {item.nota || "10"}</Text>
            </View>
          </View>

          {(item.cidade || item.cidades?.[0]) ? (
            <Text style={styles.capital}>📍 {item.cidade || item.cidades?.[0]}, {item.nome}</Text>
          ) : item.capital ? (
            <Text style={styles.capital}>📍 {item.capital}</Text>
          ) : null}

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status || "Desejo"}</Text>
          </View>

          <View style={styles.rowInfo}>
            <View style={styles.infoLeft}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={14} color="#888" />
                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.infoLabel}>Viagem</Text>
                  <Text style={styles.infoValue}>{item.dataViagem || "--/--/----"}</Text>
                </View>
              </View>
              <View style={[styles.infoItem, { marginTop: 8 }]}>
                <Ionicons name="wallet-outline" size={14} color="#888" />
                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.infoLabel}>Orçamento</Text>
                  <Text style={styles.infoValue}>R$ {exibirOrcamento(item.orcamento)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("EditTrip", { trip: item })}>
                <Ionicons name="create-outline" size={22} color="#2493FF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { marginTop: 8 }]} onPress={() => deleteTrip(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2493FF" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 65 + insets.bottom + 20, paddingTop: insets.top || 16 }}
    >
      {/* Header com logo igual ao ExploreScreen */}
      <View style={styles.header}>
        <LogoHeader />
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=32" }}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.title}>Minha Lista</Text>
      <Text style={styles.subtitle}>Acompanhe seus destinos e roteiros 💼</Text>

      <View style={styles.tabs}>
        {ABAS.map((aba) => (
          <TouchableOpacity
            key={aba}
            style={[styles.tab, abaSelecionada === aba && styles.activeTab]}
            onPress={() => setAbaSelecionada(aba)}
          >
            <Text style={[styles.tabText, abaSelecionada === aba && styles.activeTabText]}>{aba}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultado}>
        {listaAtual.length} destino{listaAtual.length !== 1 ? "s" : ""} encontrado{listaAtual.length !== 1 ? "s" : ""}
      </Text>

      <FlatList
        data={listaAtual}
        renderItem={({ item }) => renderCard(item)}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="map-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum destino aqui ainda</Text>
          </View>
        }
      />

      <Text style={styles.section}>✅ Já visitei ({visitado.length})</Text>
      <View style={styles.stats}>
        <Text style={styles.statsTitle}>📊 Estatísticas</Text>
        <Text style={styles.statLine}>Países visitados: <Text style={styles.statValue}>{visitado.length}</Text></Text>
        <Text style={styles.statLine}>Países desejados: <Text style={styles.statValue}>{desejo.length}</Text></Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA", paddingHorizontal: 18 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  avatar: { width: 50, height: 50, borderRadius: 25 },

  title: { fontSize: 38, fontWeight: "bold", color: "#0B1E4F", marginTop: 8 },
  subtitle: { color: "#777", fontSize: 15, marginTop: 6, marginBottom: 22 },

  tabs: { flexDirection: "row", backgroundColor: "#FFF", borderRadius: 18, padding: 4, marginBottom: 18, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6 },
  tab: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 14 },
  activeTab: { backgroundColor: "#E7F2FF" },
  tabText: { fontSize: 14, color: "#888", fontWeight: "500" },
  activeTabText: { color: "#2493FF", fontWeight: "bold" },

  resultado: { color: "#888", fontSize: 14, marginBottom: 16 },

  card: { backgroundColor: "#FFF", borderRadius: 24, overflow: "hidden", marginBottom: 22, elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  imageWrap: { position: "relative" },
  tripImage: { width: "100%", height: 180 },
  flagOverlay: { position: "absolute", top: 14, left: 14, width: 38, height: 26, borderRadius: 4 },
  heartBtn: { position: "absolute", top: 14, right: 14, backgroundColor: "rgba(0,0,0,0.25)", width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  cardBody: { padding: 16 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nome: { fontSize: 22, fontWeight: "bold", color: "#0B1E4F" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  rating: { color: "#FFB800", fontWeight: "bold", fontSize: 16 },
  capital: { color: "#888", fontSize: 14, marginTop: 4 },
  statusBadge: { backgroundColor: "#E7F2FF", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  statusText: { color: "#2493FF", fontWeight: "bold", fontSize: 13 },
  rowInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 },
  infoLeft: { flex: 1 },
  infoItem: { flexDirection: "row", alignItems: "center" },
  infoLabel: { fontSize: 11, color: "#AAA" },
  infoValue: { fontSize: 14, color: "#333", fontWeight: "500" },
  actions: { alignItems: "center" },
  actionBtn: { padding: 6 },

  emptyBox: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#BBB", fontSize: 15, marginTop: 12 },

  section: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 12, color: "#0B1E4F" },
  stats: { backgroundColor: "#FFF", padding: 20, borderRadius: 18, marginBottom: 10, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6 },
  statsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#0B1E4F" },
  statLine: { fontSize: 15, color: "#555", marginBottom: 6 },
  statValue: { fontWeight: "bold", color: "#2493FF" },
});