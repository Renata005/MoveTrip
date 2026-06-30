import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function AddCityScreen({ route, navigation }) {
  const { trip } = route.params;
  const [cidade, setCidade] = useState("");

  async function salvarCidade() {
    if (!cidade.trim()) {
      Alert.alert("Atenção", "Digite o nome de uma cidade.");
      return;
    }
    try {
      await updateDoc(doc(db, "trips", trip.id), {
        cidades: arrayUnion(cidade.trim()),
      });
      Alert.alert("Sucesso", "Cidade adicionada!");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#0B1E4F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar cidade</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Destino */}
      <View style={styles.destinoCard}>
        {trip.bandeira ? (
          <Image source={{ uri: trip.bandeira }} style={styles.flag} />
        ) : null}
        <View>
          <Text style={styles.destinoNome}>{trip.nome}</Text>
          <Text style={styles.destinoCapital}>📍 {trip.capital}</Text>
        </View>
      </View>

      <Text style={styles.label}>Nome da cidade</Text>
      <View style={styles.inputBox}>
        <Ionicons name="location-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Ex: Rio de Janeiro"
          placeholderTextColor="#BBB"
          value={cidade}
          onChangeText={setCidade}
          autoFocus
        />
      </View>

      <Text style={styles.dica}>
        💡 Adicione cidades que você quer visitar neste país.
      </Text>

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarCidade}>
        <Text style={styles.btnSalvarText}>Salvar cidade</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 28,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0B1E4F",
  },

  destinoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  flag: {
    width: 48,
    height: 32,
    borderRadius: 4,
  },

  destinoNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0B1E4F",
  },

  destinoCapital: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1E4F",
    marginBottom: 10,
  },

  inputBox: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  dica: {
    color: "#AAA",
    fontSize: 13,
    marginTop: 14,
    lineHeight: 20,
  },

  btnSalvar: {
    backgroundColor: "#2493FF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 36,
  },

  btnSalvarText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
  },
});