import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIAS = ["Hotel", "Restaurante", "Atração", "Loja", "Outro"];

export default function AddPlaceScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [nota, setNota] = useState("");
  const [descricao, setDescricao] = useState("");

  function salvar() {
    // Salvar lógica aqui
    navigation.goBack();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#0B1E4F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar local</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Nome */}
      <Text style={styles.label}>Nome do local</Text>
      <View style={styles.inputBox}>
        <Ionicons name="location-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Ex: Museu do Amanhã"
          placeholderTextColor="#BBB"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      {/* Categoria */}
      <Text style={styles.label}>Categoria</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, categoria === cat && styles.catBtnAtivo]}
            onPress={() => setCategoria(cat)}
          >
            <Text
              style={[styles.catText, categoria === cat && styles.catTextAtivo]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nota */}
      <Text style={styles.label}>Nota</Text>
      <View style={styles.inputBox}>
        <Ionicons name="star-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Ex: 9"
          placeholderTextColor="#BBB"
          value={nota}
          onChangeText={setNota}
          keyboardType="numeric"
          maxLength={2}
        />
      </View>

      {/* Descrição */}
      <Text style={styles.label}>Descrição</Text>
      <View style={[styles.inputBox, { alignItems: "flex-start", minHeight: 100 }]}>
        <Ionicons name="document-text-outline" size={20} color="#888" style={{ marginTop: 2 }} />
        <TextInput
          style={[styles.input, { textAlignVertical: "top" }]}
          placeholder="Conte um pouco sobre este local..."
          placeholderTextColor="#BBB"
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
        <Text style={styles.btnSalvarText}>Salvar local</Text>
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

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1E4F",
    marginBottom: 10,
    marginTop: 20,
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

  catBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E8EDF2",
    marginRight: 10,
  },

  catBtnAtivo: {
    backgroundColor: "#E7F2FF",
    borderColor: "#2493FF",
  },

  catText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },

  catTextAtivo: {
    color: "#2493FF",
    fontWeight: "bold",
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