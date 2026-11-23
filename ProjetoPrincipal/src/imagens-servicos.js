/**
 * ResolvJá - Sistema Inteligente de Imagens dos Serviços (Estável / Sem erros 402 e 500)
 * 1) Usa diretamente as 30 fotografias locais já guardadas em assets/servicos/
 * 2) Para serviços ainda sem foto local própria (ou novos serviços como ID 84),
 *    seleciona automaticamente uma foto real por palavra-chave (CDN direta do Unsplash)
 * 3) Se estiver offline ou o link falhar, usa automaticamente o fallback local da categoria
 */

// Muda para false se quiseres trabalhar 100% offline usando apenas a pasta assets/servicos/
const USAR_FALLBACK_ONLINE = true;

const IMAGEM_PADRAO_SISTEMA = "assets/servicos/faxina-limpeza-residencial.jpg";

const IMAGENS_SERVICOS_POR_ID = {
  1:  { id: 1,  nome: "Faxina", arquivo: "assets/servicos/faxina-limpeza-residencial.jpg", temFotoLocal: true,  fallback: "assets/servicos/faxina-limpeza-residencial.jpg" },
  2:  { id: 2,  nome: "Eletricista", arquivo: "assets/servicos/eletricista.jpg", temFotoLocal: true,  fallback: "assets/servicos/eletricista.jpg" },
  3:  { id: 3,  nome: "Jardinagem", arquivo: "assets/servicos/jardinagem.jpg", temFotoLocal: true,  fallback: "assets/servicos/jardinagem.jpg" },
  4:  { id: 4,  nome: "Pintura", arquivo: "assets/servicos/pintura.jpg", temFotoLocal: true,  fallback: "assets/servicos/pintura.jpg" },
  5:  { id: 5,  nome: "Encanador", arquivo: "assets/servicos/encanador.jpg", temFotoLocal: true,  fallback: "assets/servicos/encanador.jpg" },
  7:  { id: 7,  nome: "Marcenaria", arquivo: "assets/servicos/marcenaria.jpg", temFotoLocal: true,  fallback: "assets/servicos/marcenaria.jpg" },
  14: { id: 14, nome: "pedreiro", arquivo: "assets/servicos/pedreiro.jpg", temFotoLocal: true,  fallback: "assets/servicos/pedreiro.jpg" },
  16: { id: 16, nome: "Camareira", arquivo: "assets/servicos/camareira.jpg", temFotoLocal: true,  fallback: "assets/servicos/camareira.jpg" },
  39: { id: 39, nome: "Troca de Lâmpadas e Luminárias", arquivo: "assets/servicos/troca-lampadas-luminarias.jpg", temFotoLocal: true,  fallback: "assets/servicos/eletricista.jpg" },
  40: { id: 40, nome: "Manutenção de Chuveiro", arquivo: "assets/servicos/manutencao-chuveiro.jpg", temFotoLocal: true,  fallback: "assets/servicos/eletricista.jpg" },
  41: { id: 41, nome: "Montagem de Móveis", arquivo: "assets/servicos/montagem-moveis.jpg", temFotoLocal: true,  fallback: "assets/servicos/marcenaria.jpg" },
  42: { id: 42, nome: "Faxina / Limpeza Residencial", arquivo: "assets/servicos/faxina-limpeza-residencial.jpg", temFotoLocal: true,  fallback: "assets/servicos/faxina-limpeza-residencial.jpg" },
  43: { id: 43, nome: "Passadeira de Roupa", arquivo: "assets/servicos/passadeira-roupa.jpg", temFotoLocal: true,  fallback: "assets/servicos/faxina-limpeza-residencial.jpg" },
  44: { id: 44, nome: "Controle de Pragas", arquivo: "assets/servicos/controle-pragas.jpg", temFotoLocal: true,  fallback: "assets/servicos/faxina-limpeza-residencial.jpg" },
  45: { id: 45, nome: "Manicure e Pedicure", arquivo: "assets/servicos/manicure-pedicure.jpg", temFotoLocal: true,  fallback: "assets/servicos/cabeleireiro-estetica.jpg" },
  46: { id: 46, nome: "Cabeleireiro e Estética", arquivo: "assets/servicos/cabeleireiro-estetica.jpg", temFotoLocal: true,  fallback: "assets/servicos/manicure-pedicure.jpg" },
  47: { id: 47, nome: "Babá / Cuidadora Infantil", arquivo: "assets/servicos/baba-cuidadora-infantil.jpg", temFotoLocal: true,  fallback: "assets/servicos/cuidador-idosos.jpg" },
  48: { id: 48, nome: "Mecânico de Urgência", arquivo: "assets/servicos/mecanico-urgencia.jpg", temFotoLocal: true,  fallback: "assets/servicos/motorista-particular.jpg" },
  50: { id: 50, nome: "Instalação de Varal", arquivo: "assets/servicos/instalacao-varal.jpg", temFotoLocal: true,  fallback: "assets/servicos/montagem-moveis.jpg" },
  51: { id: 51, nome: "Passeador de Cães (Dog Walker)", arquivo: "assets/servicos/passeador-caes.jpg", temFotoLocal: true,  fallback: "assets/servicos/passeador-caes.jpg" },
  52: { id: 52, nome: "Acompanhante de Compras", arquivo: "assets/servicos/acompanhante-compras.jpg", temFotoLocal: true,  fallback: "assets/servicos/acompanhante-lazer.jpg" },
  53: { id: 53, nome: "Cuidador de Idosos", arquivo: "assets/servicos/cuidador-idosos.jpg", temFotoLocal: true,  fallback: "assets/servicos/acompanhante-consultas.jpg" },
  54: { id: 54, nome: "Acompanhante em Consultas", arquivo: "assets/servicos/acompanhante-consultas.jpg", temFotoLocal: true,  fallback: "assets/servicos/cuidador-idosos.jpg" },
  55: { id: 55, nome: "Motorista Particular", arquivo: "assets/servicos/motorista-particular.jpg", temFotoLocal: true,  fallback: "assets/servicos/frete-carretos.jpg" },
  56: { id: 56, nome: "Jardineiro", arquivo: "assets/servicos/jardineiro.jpg", temFotoLocal: true,  fallback: "assets/servicos/jardinagem.jpg" },
  57: { id: 57, nome: "Cozinheiro / Personal Diet", arquivo: "assets/servicos/cozinheiro-personal-diet.jpg", temFotoLocal: true,  fallback: "assets/servicos/cozinheiro-personal-diet.jpg" },
  58: { id: 58, nome: "Acompanhante de Lazer", arquivo: "assets/servicos/acompanhante-lazer.jpg", temFotoLocal: true,  fallback: "assets/servicos/acomapnhante-compras.jpg" },
  59: { id: 59, nome: "Frete e Carretos", arquivo: "assets/servicos/frete-carretos.jpg", temFotoLocal: true,  fallback: "assets/servicos/ajudante-mudanca.jpg" },
  60: { id: 60, nome: "Ajudante de Mudança", arquivo: "assets/servicos/ajudante-mudanca.jpg", temFotoLocal: true,  fallback: "assets/servicos/frete-carretos.jpg" },
  62: { id: 62, nome: "Encanador / Hidráulica", arquivo: "assets/servicos/encanador-hidraulica.jpg", temFotoLocal: true,  fallback: "assets/servicos/encanador.jpg" },
  // Equivalentes diretos que podem usar de imediato as fotos locais já existentes
  63: { id: 63, nome: "Pintor", arquivo: "assets/servicos/pintura.jpg", temFotoLocal: true,  fallback: "assets/servicos/pintura.jpg" },
  64: { id: 64, nome: "Pedreiro", arquivo: "assets/servicos/pedreiro.jpg", temFotoLocal: true,  fallback: "assets/servicos/pedreiro.jpg" },
  76: { id: 76, nome: "Marceneiro", arquivo: "assets/servicos/marcenaria.jpg", temFotoLocal: true,  fallback: "assets/servicos/marcenaria.jpg" },
  // Serviços pendentes de foto própria (usam foto real por categoria e fallback local)
  65: { id: 65, nome: "Instalação de Eletrodomésticos", arquivo: "assets/servicos/instalacao-eletrodomesticos.jpg", temFotoLocal: false, fallback: "assets/servicos/troca-lampadas-luminarias.jpg" },
  66: { id: 66, nome: "Limpeza de Estofados", arquivo: "assets/servicos/limpeza-estofados.jpg", temFotoLocal: false, fallback: "assets/servicos/faxina-limpeza-residencial.jpg" },
  67: { id: 67, nome: "Manutenção de Ar-condicionado", arquivo: "assets/servicos/manutencao-ar-condicionado.jpg", temFotoLocal: false, fallback: "assets/servicos/manutencao-chuveiro.jpg" },
  68: { id: 68, nome: "Chaveiro", arquivo: "assets/servicos/chaveiro.jpg", temFotoLocal: false, fallback: "assets/servicos/eletricista.jpg" },
  69: { id: 69, nome: "Técnico em Informática", arquivo: "assets/servicos/tecnico-em-informatica.jpg", temFotoLocal: true,  fallback: "assets/servicos/tecnico-em-informatica.jpg" },
  70: { id: 70, nome: "Personal Organizer", arquivo: "assets/servicos/personal-organizer.jpg", temFotoLocal: false, fallback: "assets/servicos/camareira.jpg" },
  71: { id: 71, nome: "Limpeza de Piscina", arquivo: "assets/servicos/limpeza-piscina.jpg", temFotoLocal: false, fallback: "assets/servicos/jardinagem.jpg" },
  72: { id: 72, nome: "Limpeza de Caixa D'água", arquivo: "assets/servicos/limpeza-caixa-dagua.jpg", temFotoLocal: false, fallback: "assets/servicos/encanador-hidraulica.jpg" },
  73: { id: 73, nome: "Serralheiro", arquivo: "assets/servicos/serralheiro.jpg", temFotoLocal: false, fallback: "assets/servicos/marcenaria.jpg" },
  74: { id: 74, nome: "Gesseiro / Drywall", arquivo: "assets/servicos/gesseiro-drywall.jpg", temFotoLocal: false, fallback: "assets/servicos/pedreiro.jpg" },
  75: { id: 75, nome: "Vidraceiro", arquivo: "assets/servicos/vidraceiro.jpg", temFotoLocal: false, fallback: "assets/servicos/montagem-moveis.jpg" },
  77: { id: 77, nome: "Instalação de Câmeras e CFTV", arquivo: "assets/servicos/instalacao-cameras-cftv.jpg", temFotoLocal: false, fallback: "assets/servicos/eletricista.jpg" },
  78: { id: 78, nome: "Suporte Técnico e Redes", arquivo: "assets/servicos/suporte-tecnico-redes.jpg", temFotoLocal: false, fallback: "assets/servicos/tecnico-em-informatica.jpg" },
  79: { id: 79, nome: "Fotografia de Eventos e Ensaios", arquivo: "assets/servicos/fotografia-eventos-ensaios.jpg", temFotoLocal: false, fallback: "assets/servicos/cabeleireiro-estetica.jpg" },
  80: { id: 80, nome: "Churrasqueiro para Eventos", arquivo: "assets/servicos/churrasqueiro-eventos.jpg", temFotoLocal: false, fallback: "assets/servicos/cozinheiro-personal-diet.jpg" },
  81: { id: 81, nome: "Garçom / Copeira", arquivo: "assets/servicos/garcom-copeira.jpg", temFotoLocal: false, fallback: "assets/servicos/camareira.jpg" },
  82: { id: 82, nome: "Pet Sitter / Babá de Pets", arquivo: "assets/servicos/pet-sitter-baba-pets.jpg", temFotoLocal: false, fallback: "assets/servicos/passeador-caes.jpg" }
};

// Regras inteligentes por palavra-chave (usadas para serviços sem foto local e novos serviços no banco)
const REGRAS_CATEGORIA_INTELIGENTE = [
  {
    palavras: ["limpeza", "faxina", "estofado", "organizer", "passadeira"],
    online: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/faxina-limpeza-residencial.jpg"
  },
  {
    palavras: ["ar-condicionado", "climatiz"],
    online: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/manutencao-chuveiro.jpg"
  },
  {
    palavras: ["hidraulic", "encanador", "piscina", "caixa d'agua", "caixa dagua", "agua"],
    online: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/encanador-hidraulica.jpg"
  },
  {
    palavras: ["gesso", "drywall", "pintor", "pintura"],
    online: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/pintura.jpg"
  },
  {
    palavras: ["serralh", "vidrac", "marcen", "movel", "moveis", "montador", "eletrodomestico"],
    online: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/marcenaria.jpg"
  },
  {
    palavras: ["computador", "informatica", "camera", "cftv", "rede", "suporte"],
    online: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/tecnico-em-informatica.jpg"
  },
  {
    palavras: ["eletric", "lampada", "chaveiro", "fiacao"],
    online: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/eletricista.jpg"
  },
  {
    palavras: ["pet", "caes", "cachorro", "gato", "dog"],
    online: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/passeador-caes.jpg"
  },
  {
    palavras: ["fotografia", "evento", "churrasqueir", "garcom", "copeira", "cozinheir"],
    online: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/cozinheiro-personal-diet.jpg"
  },
  {
    palavras: ["carro", "veiculo", "motorista", "mecanico", "frete", "mudanca", "auto"],
    online: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/mecanico-urgencia.jpg"
  },
  {
    palavras: ["baba", "idoso", "acompanhante", "cuidador"],
    online: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/cuidador-idosos.jpg"
  },
  {
    palavras: ["manicure", "pedicure", "estetica", "cabeleireir", "unha"],
    online: "https://images.unsplash.com/photo-1632345031435-8727f6c97d34?auto=format&fit=crop&w=600&q=80",
    local: "assets/servicos/cabeleireiro-estetica.jpg"
  }
];

function normalizarTextoServico(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function localizarRegistroServico(servico = {}) {
  const item = (typeof servico === "string" || typeof servico === "number")
    ? (Number.isNaN(Number(servico)) ? { nome: String(servico) } : { id: Number(servico) })
    : (servico || {});

  const idRaw = item.id_tipo_servico ?? item.id ?? item.id_servico ?? item.servico_id;
  const idNum = Number(idRaw);

  if (!Number.isNaN(idNum) && IMAGENS_SERVICOS_POR_ID[idNum]) {
    return IMAGENS_SERVICOS_POR_ID[idNum];
  }

  const nomeRaw = item.nome_servico ?? item.nome ?? item.servico ?? item.titulo ?? "";
  const nomeNorm = normalizarTextoServico(nomeRaw);
  if (nomeNorm) {
    return Object.values(IMAGENS_SERVICOS_POR_ID).find(
      (reg) => normalizarTextoServico(reg.nome) === nomeNorm
    ) || null;
  }

  return null;
}

function encontrarRegraInteligente(servico = {}) {
  const texto = normalizarTextoServico(
    `${servico.nome_servico || servico.titulo || servico.nome || ""} ${servico.descricao || ""} ${servico.categoria || ""}`
  );

  for (const regra of REGRAS_CATEGORIA_INTELIGENTE) {
    if (regra.palavras.some((p) => texto.includes(p))) {
      return regra;
    }
  }

  return {
    online: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80",
    local: IMAGEM_PADRAO_SISTEMA
  };
}

function aplicarFotoInteligenteNoCard(elemento, servico = {}) {
  if (!elemento) return;

  const registro = localizarRegistroServico(servico);
  const regra = encontrarRegraInteligente(servico);
  const fallbackLocal = (registro && registro.fallback) ? registro.fallback : regra.local;

  const definirVisual = (url) => {
    if (elemento.tagName === "IMG") {
      elemento.src = url;
    } else {
      elemento.style.backgroundImage = `url('${url}')`;
    }
  };

  // 1. Se já tens a fotografia guardada em assets/servicos/, usa-a diretamente
  if (registro && registro.temFotoLocal) {
    definirVisual(registro.arquivo);
    return;
  }

  // 2. Define o fallback local de imediato para nenhum cartão aparecer vazio
  definirVisual(fallbackLocal);

  // 3. Se estiver ativo, aplica a foto real estável da categoria (sem erros 500)
  if (!USAR_FALLBACK_ONLINE) return;

  const imgTeste = new Image();
  imgTeste.onload = () => definirVisual(regra.online);
  imgTeste.src = regra.online;
}

function obterImagemServico(servico = {}) {
  const registro = localizarRegistroServico(servico);
  if (registro && registro.temFotoLocal) return registro.arquivo;
  return (registro && registro.fallback) ? registro.fallback : encontrarRegraInteligente(servico).local;
}

if (typeof window !== "undefined") {
  window.IMAGEM_PADRAO_SISTEMA = IMAGEM_PADRAO_SISTEMA;
  window.IMAGENS_SERVICOS_POR_ID = IMAGENS_SERVICOS_POR_ID;
  window.aplicarFotoInteligenteNoCard = aplicarFotoInteligenteNoCard;
  window.obterImagemServico = obterImagemServico;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    IMAGEM_PADRAO_SISTEMA,
    IMAGENS_SERVICOS_POR_ID,
    aplicarFotoInteligenteNoCard,
    obterImagemServico
  };
}