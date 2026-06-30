import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function CountryDetailScreen({ route, navigation }) {
  const { country } = route.params;

  const moedas = country.currencies
    ? Object.values(country.currencies)
        .map((m) => `${m.name} (${m.symbol || ""})`)
        .join(", ")
    : "Não informada";

  const idiomas = country.languages
    ? Object.values(country.languages).join(", ")
    : "Não informado";

  async function salvarViagem() {
    try {
      const q = query(
        collection(db, "trips"),
        where("nome", "==", country.name.common)
      );
      const resultado = await getDocs(q);

      if (!resultado.empty) {
        Alert.alert("Aviso", `${country.name.common} já está na sua lista!`);
        return;
      }

      await addDoc(collection(db, "trips"), {
        nome: country.name.common,
        capital: country.capital?.[0] || "Não informada",
        regiao: country.region,
        populacao: country.population,
        bandeira: country.flags.png,
        imagem: `https://picsum.photos/seed/${country.cca2}/800/400`,
        moeda: moedas,
        idioma: idiomas,
        status: "Desejo",
        nota: "",
        dataViagem: "",
        orcamento: "",
        cidades: [],
      });

      Alert.alert("Sucesso", "País adicionado à sua lista!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  }

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
            uri: `https://picsum.photos/seed/${country.cca2}/800/400`,
          }}
          style={styles.heroImage}
        />

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
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

        <Image source={{ uri: country.flags.png }} style={styles.flagHero} />
      </View>

      <View style={styles.body}>
        <Text style={styles.nome}>{country.name.common}</Text>
        <Text style={styles.capital}>📍 {country.capital?.[0] || "—"}</Text>

        {/* Grid de infos */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Ionicons name="compass-outline" size={18} color="#888" />
            <Text style={styles.gridLabel}>Região</Text>
            <Text style={styles.gridValue}>{country.region || "—"}</Text>
          </View>

          <View style={styles.gridItem}>
            <Ionicons name="people-outline" size={18} color="#888" />
            <Text style={styles.gridLabel}>População</Text>
            <Text style={styles.gridValue}>
              {country.population?.toLocaleString() || "—"}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Ionicons name="cash-outline" size={18} color="#888" />
            <Text style={styles.gridLabel}>Moeda</Text>
            <Text style={styles.gridValue} numberOfLines={2}>
              {moedas}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Ionicons name="chatbubble-outline" size={18} color="#888" />
            <Text style={styles.gridLabel}>Idioma</Text>
            <Text style={styles.gridValue} numberOfLines={2}>
              {idiomas}
            </Text>
          </View>
        </View>

        {/* Descrição */}
        <Text style={styles.descricao}>
          {country.name.common} é um país localizado em {country.region},{" "}
          com capital em {country.capital?.[0] || "—"} e população de{" "}
          {country.population?.toLocaleString()} habitantes.
        </Text>
      </View>

      {/* Botões fixos */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSecundario} onPress={salvarViagem}>
          <Ionicons name="add-circle-outline" size={20} color="#2493FF" />
          <Text style={styles.btnSecundarioText}>Adicionar à lista</Text>
        </TouchableOpacity>


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  heroWrap: {
    width: "100%",
    height: 260,
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  backBtn: {
    position: "absolute",
    top: 20,
    left: 16,
    backgroundColor: "#FFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  topActions: {
    position: "absolute",
    top: 20,
    right: 16,
    flexDirection: "row",
  },

  iconBtn: {
    backgroundColor: "#FFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  flagHero: {
    position: "absolute",
    bottom: 14,
    left: 16,
    width: 44,
    height: 28,
    borderRadius: 4,
  },

  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },

  nome: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0B1E4F",
  },

  capital: {
    fontSize: 16,
    color: "#888",
    marginTop: 4,
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },

  gridItem: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    width: "47%",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  gridLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  gridValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B1E4F",
    marginTop: 2,
  },

  descricao: {
    fontSize: 15,
    color: "#444",
    lineHeight: 23,
  },

  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },

  btnSecundario: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2493FF",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 6,
  },

  btnSecundarioText: {
    color: "#2493FF",
    fontWeight: "bold",
    fontSize: 15,
  },

  btnPrimario: {
    flex: 1,
    backgroundColor: "#2493FF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  btnPrimarioText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});