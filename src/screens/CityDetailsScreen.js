import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SECOES = [
  { icone: "camera-outline",      label: "Fotos",              vazio: "Nenhuma foto adicionada" },
  { icone: "star-outline",        label: "Lugares Favoritos",  vazio: "Nenhum local cadastrado" },
  { icone: "restaurant-outline",  label: "Restaurantes",       vazio: "Nenhum restaurante cadastrado" },
  { icone: "bed-outline",         label: "Hotéis",             vazio: "Nenhum hotel cadastrado" },
  { icone: "document-text-outline", label: "Observações",      vazio: "Adicione anotações sobre a viagem" },
  { icone: "wallet-outline",      label: "Gastos",             vazio: "R$ 0,00" },
];

export default function CityDetailsScreen({ route, navigation }) {
  const { cidade } = route.params;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Hero */}
      <View style={styles.heroWrap}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
          }}
          style={styles.heroImage}
        />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#0B1E4F" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>📍 {cidade}</Text>

        {SECOES.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={s.icone} size={20} color="#2493FF" />
              </View>
              <Text style={styles.cardTitle}>{s.label}</Text>
            </View>
            <Text style={styles.cardVazio}>{s.vazio}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.btnAdicionar}
          onPress={() => navigation.navigate("AddPlace", { cidade })}
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFF" />
          <Text style={styles.btnAdicionarText}>Adicionar Local</Text>
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
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: 220,
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

  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0B1E4F",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },

  cardIconWrap: {
    backgroundColor: "#E7F2FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0B1E4F",
  },

  cardVazio: {
    color: "#AAA",
    fontSize: 14,
    marginLeft: 46,
  },

  btnAdicionar: {
    backgroundColor: "#2493FF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  btnAdicionarText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});