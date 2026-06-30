import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const STATUS_OPCOES = ["Desejo", "Planejado", "Visitado"];
function formatarOrcamento(valor) {
  const numerico = valor.replace(/\D/g, "");
  if (!numerico) return "";
  const numero = parseInt(numerico, 10) / 100;
  return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function carregarOrcamento(valorSalvo) {
  if (!valorSalvo) return "";
  const num = parseFloat(String(valorSalvo));
  if (isNaN(num)) return "";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function orcamentoParaSalvar(valorFormatado) {
  if (!valorFormatado) return "";
  return valorFormatado.replace(/\./g, "").replace(",", ".");
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function parseDate(str) {
  if (!str) return new Date();
  const parts = str.split("/");
  if (parts.length !== 3) return new Date();
  const d = new Date(parts[2], parts[1] - 1, parts[0]);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default function EditTripScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { trip } = route.params;
  const scrollRef = useRef(null);

  const [status, setStatus] = useState(trip.status || "Desejo");
  const [nota, setNota] = useState(trip.nota || "");
  const [dataViagem, setDataViagem] = useState(parseDate(trip.dataViagem));
  const [orcamento, setOrcamento] = useState(carregarOrcamento(trip.orcamento));
  const [showPicker, setShowPicker] = useState(false);

  async function salvarAlteracoes() {
    try {
      await updateDoc(doc(db, "trips", trip.id), {
        status,
        nota,
        dataViagem: formatDate(dataViagem),
        orcamento: orcamentoParaSalvar(orcamento),
      });
      Alert.alert("Sucesso", "Viagem atualizada!");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 65 + insets.bottom + 40,
          paddingTop: insets.top || 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#0B1E4F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar viagem</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Card do destino */}
        <View style={styles.destinoCard}>
          {trip.bandeira ? (
            <Image source={{ uri: trip.bandeira }} style={styles.flag} />
          ) : null}
          <View>
            <Text style={styles.destinoNome}>{trip.nome}</Text>
            <Text style={styles.destinoCapital}>📍 {trip.capital}</Text>
          </View>
        </View>

        {/* Status */}
        <Text style={styles.label}>Status da viagem</Text>
        <View style={styles.statusRow}>
          {STATUS_OPCOES.map((op) => (
            <TouchableOpacity
              key={op}
              style={[styles.statusBtn, status === op && styles.statusBtnAtivo]}
              onPress={() => setStatus(op)}
            >
              <Text style={[styles.statusText, status === op && styles.statusTextAtivo]}>
                {op}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nota */}
        <Text style={styles.label}>Nota da viagem</Text>
        <View style={styles.inputBox}>
          <Ionicons name="star-outline" size={20} color="#888" />
          <TextInput
            style={styles.input}
            value={nota}
            onChangeText={setNota}
            placeholder="De 0 a 10"
            placeholderTextColor="#BBB"
            keyboardType="numeric"
            maxLength={2}
            onFocus={() =>
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)
            }
          />
        </View>

        {/* Data */}
        <Text style={styles.label}>Data da viagem</Text>
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#888" />
          <Text style={[styles.input, { paddingTop: 2, color: "#0B1E4F" }]}>
            {formatDate(dataViagem)}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#BBB" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={dataViagem}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              setShowPicker(false);
              if (date) setDataViagem(date);
            }}
          />
        )}

        {/* Orçamento */}
        <Text style={styles.label}>Orçamento estimado</Text>
        <View style={styles.inputBox}>
          <Text style={styles.cifrao}>R$</Text>
          <TextInput
            style={styles.input}
            value={orcamento}
            onChangeText={(t) => setOrcamento(formatarOrcamento(t))}
            placeholder="Ex: 3000"
            placeholderTextColor="#BBB"
            keyboardType="numeric"
            onFocus={() =>
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)
            }
          />
        </View>

        {/* Botão */}
        <TouchableOpacity style={styles.btnSalvar} onPress={salvarAlteracoes}>
          <Text style={styles.btnSalvarText}>Salvar alterações</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC", paddingHorizontal: 20 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0B1E4F" },

  destinoCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 28, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6 },
  flag: { width: 48, height: 32, borderRadius: 4 },
  destinoNome: { fontSize: 18, fontWeight: "bold", color: "#0B1E4F" },
  destinoCapital: { fontSize: 14, color: "#888", marginTop: 2 },

  label: { fontSize: 15, fontWeight: "600", color: "#0B1E4F", marginBottom: 10, marginTop: 20 },

  statusRow: { flexDirection: "row", gap: 10 },
  statusBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E8EDF2" },
  statusBtnAtivo: { backgroundColor: "#E7F2FF", borderColor: "#2493FF" },
  statusText: { fontSize: 14, color: "#888", fontWeight: "500" },
  statusTextAtivo: { color: "#2493FF", fontWeight: "bold" },

  inputBox: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#E8EDF2", flexDirection: "row", alignItems: "center", gap: 10 },
  input: { flex: 1, fontSize: 15, color: "#333" },
  cifrao: { fontSize: 15, color: "#555", fontWeight: "600" },

  btnSalvar: { backgroundColor: "#2493FF", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 36 },
  btnSalvarText: { color: "#FFF", fontSize: 17, fontWeight: "bold" },
});