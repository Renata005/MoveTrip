import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function exibirOrcamento(valor) {
  if (!valor) return "0";
  const num = parseFloat(String(valor).replace(",", "."));
  if (isNaN(num)) return valor;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TripDetailsScreen({ route, navigation }) {
  const { trip } = route.params;

  const infoGrid = [
    trip.regiao     && { icone: "compass-outline",    label: "Região",    valor: trip.regiao },
    trip.capital    && { icone: "business-outline",   label: "Capital",   valor: trip.capital },
    trip.moeda      && { icone: "cash-outline",       label: "Moeda",     valor: trip.moeda },
    trip.idioma     && { icone: "chatbubble-outline", label: "Idioma",    valor: trip.idioma },
    trip.dataViagem && { icone: "calendar-outline",   label: "Viagem",    valor: trip.dataViagem },
    trip.dataVolta  && { icone: "calendar-outline",   label: "Volta",     valor: trip.dataVolta },
    trip.orcamento  && { icone: "wallet-outline",     label: "Orçamento", valor: `R$ ${exibirOrcamento(trip.orcamento)}` },
    trip.noites     && { icone: "moon-outline",       label: "Noites",    valor: `${trip.noites}` },
  ].filter(Boolean);

  const fotos = trip.imagens && trip.imagens.length > 0 ? trip.imagens : [];
  const localExibido = trip.cidade || trip.cidades?.[0] || null;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Hero */}
      <View style={styles.heroWrap}>
        <Image
          source={{
            uri: trip.imagem || fotos[0] ||
              `https://picsum.photos/seed/${trip.nome || "trip"}/800/400`,
          }}
          style={styles.heroImage}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0B1E4F" />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={22} color="#2493FF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { marginLeft: 10 }]}>
            <Ionicons name="share-outline" size={22} color="#0B1E4F" />
          </TouchableOpacity>
        </View>
        {trip.bandeira ? (
          <Image source={{ uri: trip.bandeira }} style={styles.flagHero} />
        ) : null}
      </View>

      <View style={styles.body}>
        {/* Nome */}
        <Text style={styles.nome}>{trip.nomeRoteiro || trip.nome}</Text>

        {/* Cidade visitada em vez da capital */}
        {localExibido ? (
          <Text style={styles.capital}>📍 {localExibido}, {trip.nome}</Text>
        ) : trip.capital ? (
          <Text style={styles.capital}>📍 {trip.capital}</Text>
        ) : null}

        {/* Badge status */}
        {trip.status ? (
          <View style={[
            styles.badge,
            trip.status === "Visitado" && styles.badgeVisitado,
            trip.status === "Planejado" && styles.badgePlanejado,
          ]}>
            <Text style={[
              styles.badgeText,
              trip.status === "Visitado" && styles.badgeTextVisitado,
              trip.status === "Planejado" && styles.badgeTextPlanejado,
            ]}>
              {trip.status}
            </Text>
          </View>
        ) : null}

        {/* Grid */}
        {infoGrid.length > 0 && (
          <View style={styles.grid}>
            {infoGrid.map((item, i) => (
              <View key={i} style={styles.gridItem}>
                <Ionicons name={item.icone} size={18} color="#888" />
                <Text style={styles.gridLabel}>{item.label}</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{item.valor}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Nota */}
        {trip.nota ? (
          <View style={styles.notaBox}>
            <Ionicons name="star" size={18} color="#FFB800" />
            <Text style={styles.gridLabel}>Nota</Text>
            <Text style={styles.gridValue}>{trip.nota}</Text>
          </View>
        ) : null}

        {/* Descrição */}
        {trip.descricao ? (
          <Text style={styles.descricao}>{trip.descricao}</Text>
        ) : null}

        {/* Fotos */}
        {fotos.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Fotos</Text>
              <Text style={styles.fotosContador}>{fotos.length} foto{fotos.length !== 1 ? "s" : ""}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              {fotos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.foto} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Cidades */}
        {trip.cidades && trip.cidades.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cidades</Text>
            {trip.cidades.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={styles.cidadeCard}
                onPress={() => navigation.navigate("CityDetails", { cidade: c })}
              >
                <Ionicons name="location-outline" size={18} color="#2493FF" />
                <Text style={styles.cidadeNome}>{c}</Text>
                <Ionicons name="chevron-forward" size={18} color="#CCC" />
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      {/* Botões — redesenhados */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnSecundario}
          onPress={() => navigation.navigate("AddCity", { trip })}
        >
          <Ionicons name="add-circle-outline" size={18} color="#2493FF" />
          <Text style={styles.btnSecundarioText}>Adicionar cidade</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimario}
          onPress={() => navigation.navigate("NewTripTab", { screen: "NewTrip" })}
        >
          <Text style={styles.btnPrimarioText}>Novo roteiro</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },

  heroWrap: { width: "100%", height: 260, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  backBtn: { position: "absolute", top: 20, left: 16, backgroundColor: "#FFF", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 3 },
  topActions: { position: "absolute", top: 20, right: 16, flexDirection: "row" },
  iconBtn: { backgroundColor: "#FFF", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 3 },
  flagHero: { position: "absolute", bottom: 14, left: 16, width: 44, height: 28, borderRadius: 4 },

  body: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  nome: { fontSize: 32, fontWeight: "bold", color: "#0B1E4F" },
  capital: { fontSize: 16, color: "#888", marginTop: 4, marginBottom: 12 },

  badge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 20, backgroundColor: "#E7F2FF" },
  badgeVisitado: { backgroundColor: "#E8F5E9" },
  badgePlanejado: { backgroundColor: "#FFF8E1" },
  badgeText: { color: "#2493FF", fontWeight: "bold", fontSize: 14 },
  badgeTextVisitado: { color: "#43A047" },
  badgeTextPlanejado: { color: "#F9A825" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  gridItem: { backgroundColor: "#FFF", borderRadius: 14, padding: 14, width: "47%", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6 },
  gridLabel: { fontSize: 12, color: "#888", marginTop: 4 },
  gridValue: { fontSize: 14, fontWeight: "600", color: "#0B1E4F", marginTop: 2 },

  notaBox: { backgroundColor: "#FFF", borderRadius: 14, padding: 14, width: "47%", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, marginBottom: 20 },

  descricao: { fontSize: 15, color: "#444", lineHeight: 22, marginBottom: 20 },

  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#0B1E4F", marginBottom: 14, marginTop: 8 },
  fotosContador: { fontSize: 13, color: "#AAA" },
  foto: { width: 110, height: 90, borderRadius: 14, marginRight: 10 },

  cidadeCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 14, padding: 14, marginBottom: 10, gap: 10, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4 },
  cidadeNome: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0B1E4F" },

  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  btnSecundario: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2493FF",
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
    backgroundColor: "#FFF",
  },
  btnSecundarioText: { color: "#2493FF", fontWeight: "bold", fontSize: 14 },
  btnPrimario: {
    flex: 1,
    backgroundColor: "#2493FF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    elevation: 3,
    shadowColor: "#2493FF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnPrimarioText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
});