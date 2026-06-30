import { useState, useRef, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Modal, FlatList,
  Platform, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { getAllCountries } from "../services/countriesApi";

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function calcularNoites(checkIn, checkOut) {
  try {
    const diff = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  } catch { return 0; }
}

function formatarOrcamento(valor) {
  const numerico = valor.replace(/\D/g, "");
  if (!numerico) return "";
  const numero = parseFloat(numerico) / 100;
  return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function orcamentoParaSalvar(valorFormatado) {
  if (!valorFormatado) return "";
  return valorFormatado.replace(/\./g, "").replace(",", ".");
}

const STATUS_OPCOES = [
  { valor: "Desejo",    icone: "heart-outline",              cor: "#FF6B6B", descricao: "Quero visitar" },
  { valor: "Planejado", icone: "calendar-outline",           cor: "#F9A825", descricao: "Já planejei" },
  { valor: "Visitado",  icone: "checkmark-circle-outline",   cor: "#43A047", descricao: "Já visitei" },
];

const VISIBILIDADES = [
  { valor: "Privado", descricao: "Apenas você pode ver", icone: "lock-closed-outline" },
  { valor: "Público", descricao: "Qualquer pessoa pode ver", icone: "globe-outline" },
];

export default function NewTripScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const destinoInicial = route?.params?.country || null;

  const [nomeRoteiro, setNomeRoteiro] = useState("");
  const [destino, setDestino] = useState(destinoInicial);
  const [cidade, setCidade] = useState("");
  const [status, setStatus] = useState("Planejado");
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [orcamento, setOrcamento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [visibilidade, setVisibilidade] = useState("Privado");
  const [imagens, setImagens] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [carregandoFotos, setCarregandoFotos] = useState(false);

  const [showPickerIn, setShowPickerIn] = useState(false);
  const [showPickerOut, setShowPickerOut] = useState(false);
  const [modalDestino, setModalDestino] = useState(false);
  const [searchDestino, setSearchDestino] = useState("");
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [modalVis, setModalVis] = useState(false);

  const noites = calcularNoites(checkIn, checkOut);

  async function abrirModalDestino() {
    setModalDestino(true);
    if (countries.length === 0) {
      setLoadingCountries(true);
      const data = await getAllCountries();
      data.sort((a, b) => a.name.common.localeCompare(b.name.common));
      setCountries(data);
      setLoadingCountries(false);
    }
  }

  async function escolherImagens() {
    if (imagens.length >= 10) {
      Alert.alert("Limite atingido", "Você já adicionou o máximo de 10 fotos.");
      return;
    }
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria.");
      return;
    }

    setCarregandoFotos(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 10 - imagens.length,
        quality: 0.5, // menor qualidade = carrega mais rápido
        exif: false,  // não carregar metadados desnecessários
      });
      if (!result.canceled) {
        const novas = result.assets.map((a) => a.uri);
        setImagens((prev) => [...prev, ...novas].slice(0, 10));
      }
    } finally {
      setCarregandoFotos(false);
    }
  }

  function removerImagem(index) {
    setImagens((prev) => prev.filter((_, i) => i !== index));
  }

  async function criarRoteiro() {
    if (!nomeRoteiro.trim()) {
      Alert.alert("Atenção", "Digite um nome para o roteiro.");
      return;
    }
    if (!destino) {
      Alert.alert("Atenção", "Selecione um destino.");
      return;
    }

    setSalvando(true);
    try {
      const moedas = destino.currencies
        ? Object.values(destino.currencies).map((m) => `${m.name} (${m.symbol || ""})`).join(", ")
        : "";
      const idiomas = destino.languages
        ? Object.values(destino.languages).join(", ")
        : "";

      await addDoc(collection(db, "trips"), {
        nome: destino.name.common,
        nomeRoteiro: nomeRoteiro.trim(),
        capital: destino.capital?.[0] || "",
        cidade: cidade.trim(),
        regiao: destino.region || "",
        bandeira: destino.flags?.png || "",
        imagem: imagens[0] || `https://picsum.photos/seed/${destino.cca2}/800/400`,
        imagens: imagens,
        moeda: moedas,
        idioma: idiomas,
        status: status,
        nota: "",
        dataViagem: formatDate(checkIn),
        dataVolta: formatDate(checkOut),
        noites: noites,
        orcamento: orcamentoParaSalvar(orcamento),
        descricao: descricao.trim(),
        visibilidade: visibilidade,
        destaque: false,
        cidades: cidade.trim() ? [cidade.trim()] : [],
        criadoEm: new Date().toISOString(),
      });

      Alert.alert("✅ Roteiro criado!", `"${nomeRoteiro}" foi adicionado à sua lista.`, [
        { text: "Ver minha lista", onPress: () => navigation.navigate("MyListTab") },
        { text: "Continuar explorando", onPress: () => navigation.navigate("ExploreTab") },
      ]);
    } catch (error) {
      console.log("Erro ao criar roteiro:", error);
      Alert.alert("Erro", "Não foi possível criar o roteiro. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const countriesFiltrados = countries.filter((c) =>
    c.name.common.toLowerCase().includes(searchDestino.toLowerCase())
  );

  const visAtual = VISIBILIDADES.find((v) => v.valor === visibilidade);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 65 + insets.bottom + 30, paddingTop: insets.top || 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#0B1E4F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo roteiro</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Nome */}
      <Text style={styles.label}>Nome do roteiro</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Fim de semana em Paris"
          placeholderTextColor="#BBB"
          value={nomeRoteiro}
          onChangeText={setNomeRoteiro}
          maxLength={50}
        />
        <Text style={styles.charCount}>{nomeRoteiro.length}/50</Text>
      </View>

      {/* Destino */}
      <Text style={styles.label}>País de destino</Text>
      <TouchableOpacity style={styles.destinoBox} onPress={abrirModalDestino}>
        {destino ? (
          <View style={styles.destinoRow}>
            <Image source={{ uri: destino.flags?.png }} style={styles.destinoFlag} />
            <Text style={styles.destinoNome}>{destino.name?.common}</Text>
            <TouchableOpacity
              onPress={() => { setDestino(null); setCidade(""); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={22} color="#BBB" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.destinoVazio}>
            <Ionicons name="search-outline" size={18} color="#BBB" />
            <Text style={styles.destinoPlaceholder}>Buscar e selecionar país</Text>
            <Ionicons name="chevron-down" size={18} color="#BBB" />
          </View>
        )}
      </TouchableOpacity>

      {/* Cidade */}
      {destino && (
        <>
          <Text style={styles.label}>Cidade que visitou / vai visitar</Text>
          <View style={styles.inputBoxRow}>
            <Ionicons name="location-outline" size={20} color="#888" />
            <TextInput
              style={[styles.input, { marginLeft: 10 }]}
              placeholder="Ex.: Paris, Roma, Tóquio..."
              placeholderTextColor="#BBB"
              value={cidade}
              onChangeText={setCidade}
            />
          </View>
          <Text style={styles.dicaText}>
            💡 Pode adicionar mais cidades depois nos detalhes do roteiro
          </Text>
        </>
      )}

      {/* Status */}
      <Text style={styles.label}>Status da viagem</Text>
      <View style={styles.statusRow}>
        {STATUS_OPCOES.map((op) => (
          <TouchableOpacity
            key={op.valor}
            style={[styles.statusBtn, status === op.valor && { borderColor: op.cor, backgroundColor: op.cor + "15" }]}
            onPress={() => setStatus(op.valor)}
          >
            <Ionicons name={op.icone} size={20} color={status === op.valor ? op.cor : "#AAA"} />
            <Text style={[styles.statusText, status === op.valor && { color: op.cor, fontWeight: "bold" }]}>
              {op.valor}
            </Text>
            <Text style={styles.statusDesc}>{op.descricao}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Período */}
      <Text style={styles.label}>Período da viagem</Text>
      <View style={styles.periodoBox}>
        <View style={styles.periodoField}>
          <Text style={styles.periodoLabel}>CHECK-IN</Text>
          <TouchableOpacity style={styles.periodoRow} onPress={() => setShowPickerIn(true)}>
            <Text style={styles.periodoValor}>{formatDate(checkIn)}</Text>
            <Ionicons name="calendar-outline" size={18} color="#2493FF" />
          </TouchableOpacity>
        </View>
        <View style={styles.periodoDiv} />
        <View style={styles.periodoField}>
          <Text style={styles.periodoLabel}>CHECK-OUT</Text>
          <TouchableOpacity style={styles.periodoRow} onPress={() => setShowPickerOut(true)}>
            <Text style={styles.periodoValor}>{formatDate(checkOut)}</Text>
            <Ionicons name="calendar-outline" size={18} color="#2493FF" />
          </TouchableOpacity>
        </View>
      </View>

      {noites > 0 && (
        <View style={styles.noitesBadge}>
          <Ionicons name="moon-outline" size={14} color="#2493FF" />
          <Text style={styles.noitesText}> {noites} noite{noites !== 1 ? "s" : ""}</Text>
        </View>
      )}

      {showPickerIn && (
        <DateTimePicker
          value={checkIn}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => { setShowPickerIn(false); if (date) setCheckIn(date); }}
        />
      )}
      {showPickerOut && (
        <DateTimePicker
          value={checkOut}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => { setShowPickerOut(false); if (date) setCheckOut(date); }}
        />
      )}

      {/* Orçamento */}
      <Text style={styles.label}>Orçamento estimado</Text>
      <View style={styles.inputBoxRow}>
        <Text style={styles.cifrao}>R$</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor="#BBB"
          keyboardType="numeric"
          value={orcamento}
          onChangeText={(t) => setOrcamento(formatarOrcamento(t))}
        />
      </View>

      {/* Descrição */}
      <Text style={styles.label}>Descrição (opcional)</Text>
      <View style={styles.descricaoBox}>
        <TextInput
          style={styles.descricaoInput}
          placeholder="Conte um pouco sobre sua viagem..."
          placeholderTextColor="#BBB"
          multiline
          maxLength={200}
          value={descricao}
          onChangeText={setDescricao}
        />
        <Text style={styles.charCount}>{descricao.length}/200</Text>
      </View>

      {/* Fotos */}
      <View style={styles.fotosHeader}>
        <Text style={styles.label}>Fotos do roteiro</Text>
        <Text style={styles.fotosContador}>{imagens.length}/10</Text>
      </View>

      {/* Grid de thumbs — usa FlatList horizontal para não travar */}
      {imagens.length > 0 && (
        <FlatList
          data={imagens}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          removeClippedSubviews={true}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          renderItem={({ item, index }) => (
            <View style={styles.fotoThumbWrap}>
              <Image
                source={{ uri: item }}
                style={styles.fotoThumb}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.fotoRemover} onPress={() => removerImagem(index)}>
                <Ionicons name="close-circle" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {imagens.length < 10 && (
        <TouchableOpacity
          style={[styles.imagemBox, carregandoFotos && { opacity: 0.6 }]}
          onPress={escolherImagens}
          disabled={carregandoFotos}
        >
          {carregandoFotos ? (
            <>
              <ActivityIndicator size="small" color="#2493FF" />
              <Text style={styles.imagemTitle}>Carregando fotos...</Text>
            </>
          ) : (
            <>
              <Ionicons name="images-outline" size={38} color="#BBB" />
              <Text style={styles.imagemTitle}>
                {imagens.length === 0 ? "Adicionar fotos" : "Adicionar mais fotos"}
              </Text>
              <Text style={styles.imagemSub}>
                {imagens.length === 0
                  ? "Escolha até 10 imagens da sua galeria"
                  : `Ainda pode adicionar ${10 - imagens.length} foto${10 - imagens.length !== 1 ? "s" : ""}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Visibilidade */}
      <Text style={styles.label}>Visibilidade</Text>
      <TouchableOpacity style={styles.visBox} onPress={() => setModalVis(true)}>
        <Ionicons name={visAtual.icone} size={22} color="#555" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.visTitle}>{visAtual.valor}</Text>
          <Text style={styles.visSub}>{visAtual.descricao}</Text>
        </View>
        <Ionicons name="chevron-down" size={22} color="#555" />
      </TouchableOpacity>

      {/* Botão criar */}
      <TouchableOpacity
        style={[styles.btnCriar, salvando && styles.btnCriarDisabled]}
        onPress={criarRoteiro}
        disabled={salvando}
      >
        {salvando
          ? <ActivityIndicator color="#FFF" size="small" />
          : <Text style={styles.btnCriarText}>Criar roteiro</Text>
        }
      </TouchableOpacity>

      {/* Modal Destino */}
      <Modal visible={modalDestino} animationType="slide" onRequestClose={() => setModalDestino(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top || 20 }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setModalDestino(false); setSearchDestino(""); }}>
              <Ionicons name="arrow-back" size={24} color="#0B1E4F" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Selecionar país</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalSearch}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar país..."
              placeholderTextColor="#BBB"
              value={searchDestino}
              onChangeText={setSearchDestino}
              autoFocus
            />
            {searchDestino.length > 0 && (
              <TouchableOpacity onPress={() => setSearchDestino("")}>
                <Ionicons name="close-circle" size={18} color="#BBB" />
              </TouchableOpacity>
            )}
          </View>

          {loadingCountries ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#2493FF" />
            </View>
          ) : (
            <FlatList
              data={countriesFiltrados.slice(0, 50)}
              keyExtractor={(item) => item.cca2}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setDestino(item);
                    setCidade("");
                    setModalDestino(false);
                    setSearchDestino("");
                  }}
                >
                  <Image source={{ uri: item.flags.png }} style={styles.modalFlag} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemNome}>{item.name.common}</Text>
                    {item.capital?.[0] && (
                      <Text style={styles.modalItemCapital}>📍 {item.capital[0]}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Modal Visibilidade */}
      <Modal visible={modalVis} transparent animationType="fade" onRequestClose={() => setModalVis(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVis(false)}>
          <View style={[styles.visModal, { paddingBottom: insets.bottom + 24 }]}>
            <Text style={styles.visModalTitle}>Visibilidade do roteiro</Text>
            {VISIBILIDADES.map((v) => (
              <TouchableOpacity
                key={v.valor}
                style={[styles.visModalItem, visibilidade === v.valor && styles.visModalItemAtivo]}
                onPress={() => { setVisibilidade(v.valor); setModalVis(false); }}
              >
                <Ionicons name={v.icone} size={22} color={visibilidade === v.valor ? "#2493FF" : "#555"} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.visModalItemNome, visibilidade === v.valor && { color: "#2493FF" }]}>
                    {v.valor}
                  </Text>
                  <Text style={styles.visModalItemDesc}>{v.descricao}</Text>
                </View>
                {visibilidade === v.valor && <Ionicons name="checkmark-circle" size={22} color="#2493FF" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC", paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0B1E4F" },
  label: { fontSize: 16, fontWeight: "600", color: "#0B1E4F", marginBottom: 10, marginTop: 20 },

  inputBox: { backgroundColor: "#FFF", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#E8EDF2" },
  inputBoxRow: { backgroundColor: "#FFF", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#E8EDF2", flexDirection: "row", alignItems: "center" },
  input: { fontSize: 15, color: "#333", flex: 1 },
  charCount: { textAlign: "right", color: "#BBB", fontSize: 12, marginTop: 6 },
  cifrao: { fontSize: 15, color: "#555", marginRight: 10, fontWeight: "600" },
  dicaText: { fontSize: 12, color: "#AAA", marginTop: 8, lineHeight: 18 },

  destinoBox: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#E8EDF2" },
  destinoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  destinoFlag: { width: 44, height: 30, borderRadius: 4 },
  destinoNome: { flex: 1, fontSize: 16, fontWeight: "bold", color: "#0B1E4F" },
  destinoVazio: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center", paddingVertical: 4 },
  destinoPlaceholder: { color: "#BBB", fontSize: 15, flex: 1, textAlign: "center" },

  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: "#E8EDF2", backgroundColor: "#FFF", padding: 12, alignItems: "center", gap: 4 },
  statusText: { fontSize: 13, color: "#AAA", fontWeight: "500", textAlign: "center" },
  statusDesc: { fontSize: 10, color: "#CCC", textAlign: "center" },

  periodoBox: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#E8EDF2", flexDirection: "row", alignItems: "center" },
  periodoField: { flex: 1 },
  periodoLabel: { fontSize: 10, color: "#AAA", marginBottom: 6, letterSpacing: 0.8 },
  periodoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  periodoValor: { fontSize: 15, color: "#0B1E4F", fontWeight: "600" },
  periodoDiv: { width: 1, height: 36, backgroundColor: "#E8EDF2", marginHorizontal: 12 },

  noitesBadge: { backgroundColor: "#E7F2FF", alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10, flexDirection: "row", alignItems: "center" },
  noitesText: { color: "#2493FF", fontWeight: "bold", fontSize: 13 },

  descricaoBox: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#E8EDF2", minHeight: 110 },
  descricaoInput: { fontSize: 15, color: "#333", textAlignVertical: "top", minHeight: 70 },

  fotosHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 },
  fotosContador: { fontSize: 13, color: "#AAA", fontWeight: "600" },
  fotoThumbWrap: { position: "relative", marginRight: 10 },
  fotoThumb: { width: 100, height: 100, borderRadius: 12 },
  fotoRemover: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 11 },

  imagemBox: { backgroundColor: "#FFF", borderRadius: 14, borderWidth: 1, borderColor: "#E8EDF2", borderStyle: "dashed", alignItems: "center", justifyContent: "center", paddingVertical: 28, gap: 8, marginTop: 10 },
  imagemTitle: { fontSize: 16, color: "#555", fontWeight: "600", marginTop: 4 },
  imagemSub: { fontSize: 13, color: "#BBB", textAlign: "center", paddingHorizontal: 20 },

  visBox: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#E8EDF2", flexDirection: "row", alignItems: "center" },
  visTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  visSub: { fontSize: 12, color: "#888", marginTop: 2 },

  btnCriar: { backgroundColor: "#2493FF", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 30 },
  btnCriarDisabled: { backgroundColor: "#A0C8FF" },
  btnCriarText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  modalContainer: { flex: 1, backgroundColor: "#F7F9FC" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E8EDF2" },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0B1E4F" },
  modalSearch: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", margin: 16, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E8EDF2", gap: 8 },
  modalSearchInput: { flex: 1, fontSize: 15, color: "#333" },
  modalItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4 },
  modalFlag: { width: 44, height: 30, borderRadius: 4, marginRight: 14 },
  modalItemNome: { fontSize: 16, fontWeight: "600", color: "#0B1E4F" },
  modalItemCapital: { fontSize: 13, color: "#888", marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  visModal: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  visModalTitle: { fontSize: 18, fontWeight: "bold", color: "#0B1E4F", marginBottom: 20 },
  visModalItem: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1.5, borderColor: "#E8EDF2" },
  visModalItemAtivo: { borderColor: "#2493FF", backgroundColor: "#F0F8FF" },
  visModalItemNome: { fontSize: 15, fontWeight: "600", color: "#333" },
  visModalItemDesc: { fontSize: 12, color: "#888", marginTop: 2 },
});