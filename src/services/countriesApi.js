const FALLBACK = [
  {
    cca2: "BR",
    name: { common: "Brasil" },
    capital: ["Brasília"],
    flags: { png: "https://flagcdn.com/w320/br.png" },
    population: 203062512,
    region: "América do Sul",
    currencies: { BRL: { name: "Real brasileiro", symbol: "R$" } },
    languages: { por: "Português" },
  },
  {
    cca2: "FR",
    name: { common: "França" },
    capital: ["Paris"],
    flags: { png: "https://flagcdn.com/w320/fr.png" },
    population: 67391582,
    region: "Europa",
    currencies: { EUR: { name: "Euro", symbol: "€" } },
    languages: { fra: "Francês" },
  },
  {
    cca2: "JP",
    name: { common: "Japão" },
    capital: ["Tóquio"],
    flags: { png: "https://flagcdn.com/w320/jp.png" },
    population: 125681593,
    region: "Ásia",
    currencies: { JPY: { name: "Iene japonês", symbol: "¥" } },
    languages: { jpn: "Japonês" },
  },
  {
    cca2: "IT",
    name: { common: "Itália" },
    capital: ["Roma"],
    flags: { png: "https://flagcdn.com/w320/it.png" },
    population: 60367477,
    region: "Europa",
    currencies: { EUR: { name: "Euro", symbol: "€" } },
    languages: { ita: "Italiano" },
  },
  {
    cca2: "US",
    name: { common: "Estados Unidos" },
    capital: ["Washington, D.C."],
    flags: { png: "https://flagcdn.com/w320/us.png" },
    population: 331002651,
    region: "América do Norte",
    currencies: { USD: { name: "Dólar americano", symbol: "$" } },
    languages: { eng: "Inglês" },
  },
  {
    cca2: "AR",
    name: { common: "Argentina" },
    capital: ["Buenos Aires"],
    flags: { png: "https://flagcdn.com/w320/ar.png" },
    population: 45195774,
    region: "América do Sul",
    currencies: { ARS: { name: "Peso argentino", symbol: "$" } },
    languages: { spa: "Espanhol" },
  },
  {
    cca2: "ES",
    name: { common: "Espanha" },
    capital: ["Madrid"],
    flags: { png: "https://flagcdn.com/w320/es.png" },
    population: 46754778,
    region: "Europa",
    currencies: { EUR: { name: "Euro", symbol: "€" } },
    languages: { spa: "Espanhol" },
  },
  {
    cca2: "PT",
    name: { common: "Portugal" },
    capital: ["Lisboa"],
    flags: { png: "https://flagcdn.com/w320/pt.png" },
    population: 10196709,
    region: "Europa",
    currencies: { EUR: { name: "Euro", symbol: "€" } },
    languages: { por: "Português" },
  },
  {
    cca2: "DE",
    name: { common: "Alemanha" },
    capital: ["Berlim"],
    flags: { png: "https://flagcdn.com/w320/de.png" },
    population: 83783942,
    region: "Europa",
    currencies: { EUR: { name: "Euro", symbol: "€" } },
    languages: { deu: "Alemão" },
  },
  {
    cca2: "MX",
    name: { common: "México" },
    capital: ["Cidade do México"],
    flags: { png: "https://flagcdn.com/w320/mx.png" },
    population: 128932753,
    region: "América do Norte",
    currencies: { MXN: { name: "Peso mexicano", symbol: "$" } },
    languages: { spa: "Espanhol" },
  },
  {
    cca2: "CN",
    name: { common: "China" },
    capital: ["Pequim"],
    flags: { png: "https://flagcdn.com/w320/cn.png" },
    population: 1402112000,
    region: "Ásia",
    currencies: { CNY: { name: "Yuan chinês", symbol: "¥" } },
    languages: { zho: "Chinês" },
  },
  {
    cca2: "AU",
    name: { common: "Austrália" },
    capital: ["Camberra"],
    flags: { png: "https://flagcdn.com/w320/au.png" },
    population: 25499884,
    region: "Oceania",
    currencies: { AUD: { name: "Dólar australiano", symbol: "$" } },
    languages: { eng: "Inglês" },
  },
];

export async function getAllCountries() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/paises",
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!Array.isArray(data)) throw new Error("API não retornou um array");

    const paises = data
      .map((p) => {
        const codigo2 = p.id?.["ISO-3166-1-ALPHA-2"];
        const nomePortugues = p.nome?.abreviado;

        if (!codigo2 || !nomePortugues) return null;

        return {
          cca2: codigo2,
          name: { common: nomePortugues },
          capital: p.governo?.capital?.nome ? [p.governo.capital.nome] : [],
          flags: {
            png: `https://flagcdn.com/w320/${codigo2.toLowerCase()}.png`,
          },
          population: undefined,
          region: p.regiao?.nome || "",
          currencies: p["unidades-monetarias"]?.[0]
            ? {
                [p["unidades-monetarias"][0].id?.["ISO-4217-ALPHA"] || "N/A"]: {
                  name: p["unidades-monetarias"][0].nome,
                  symbol: "",
                },
              }
            : undefined,
          languages: Array.isArray(p.linguas) && p.linguas.length > 0
            ? p.linguas.reduce((acc, l) => {
                acc[l.id?.["ISO-639-1"] || l.nome] = l.nome;
                return acc;
              }, {})
            : undefined,
        };
      })
      .filter(Boolean);

    if (paises.length === 0) throw new Error("Nenhum país processado");

    return paises;
  } catch (error) {
    console.log("API indisponível, usando fallback:", error.message);
    return FALLBACK;
  }
}