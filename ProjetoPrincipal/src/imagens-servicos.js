/**
 * ResolvJá - Arquivo de Imagens dos Serviços (Atualizado)
 * Mapeia os 50 serviços do banco de dados (30 imagens já geradas + 20 pendentes IDs 63..82
 * com fallback seguro para não quebrar o catálogo nem a tela 'Escolher Serviços').
 */

const IMAGENS_SERVICOS_POR_ID = {
  1: { id: 1, nome: "Faxina", arquivo: "assets/servicos/faxina.jpg", fallback: "assets/servicos/faxina.jpg"}, 
  2: { id: 2, nome: "Eletricista", arquivo: "assets/servicos/eletricista.jpg", fallback: "assets/servicos/eletricista.jpg"},
  3: { id: 3, nome: "Jardinagem", arquivo: "assets/servicos/jardinagem.jpg", fallback: "assets/servicos/jardinagem.jpg"},
  4: { id: 4, nome: "Pintura", arquivo: "assets/servicos/pintura.jpg", fallback: "assets/servicos/pintura.jpg"},
  5: { id: 5, nome: "Encanador", arquivo: "assets/servicos/encanador.jpg", fallback: "assets/servicos/encanador.jpg"},
  7: { id: 7, nome: "Marcenaria", arquivo: "assets/servicos/marcenaria.jpg", fallback: "assets/servicos/marcenaria.jpg"}, 
  14: { id: 14, nome: "pedreiro", arquivo: "assets/servicos/pedreiro.jpg", fallback: "assets/servicos/pedreiro.jpg",}, 
  16: { id: 16, nome: "Camareira", arquivo: "assets/servicos/camareira.jpg", fallback: "assets/servicos/camareira.jpg" },
  39: { id: 39, nome: "Troca de Lâmpadas e Luminárias", arquivo: "assets/servicos/troca-lampadas-luminarias.jpg", fallback: "assets/servicos/troca-lampadas-luminarias.jpg"},
  40: { id: 40, nome: "Manutenção de Chuveiro", arquivo: "assets/servicos/manutencao-chuveiro.jpg", fallback: "assets/servicos/manutencao-chuveiro.jpg",},
  41: { id: 41, nome: "Montagem de Móveis", arquivo: "assets/servicos/montagem-moveis.jpg", fallback: "assets/servicos/montagem-moveis.jpg",},
  42: { id: 42, nome: "Faxina / Limpeza Residencial", arquivo: "assets/servicos/faxina-limpeza-residencial.jpg", fallback: "assets/servicos/faxina-limpeza-residencial.jpg"}, 
  43: { id: 43, nome: "Passadeira de Roupa", arquivo: "assets/servicos/passadeira-roupa.jpg", fallback: "assets/servicos/passadeira-roupa.jpg"},
  44: { id: 44, nome: "Controle de Pragas", arquivo: "assets/servicos/controle-pragas.jpg", fallback: "assets/servicos/controle-pragas.jpg", gerada: true }, 
  45: { id: 45, nome: "Manicure e Pedicure", arquivo: "assets/servicos/manicure-pedicure.jpg", fallback: "assets/servicos/manicure-pedicure.jpg", gerada: true }, 
  46: { id: 46, nome: "Cabeleireiro e Estética", arquivo: "assets/servicos/cabeleireiro-estetica.jpg", fallback: "assets/servicos/cabeleireiro-estetica.jpg" }, 
  47: { id: 47, nome: "Babá / Cuidadora Infantil", arquivo: "assets/servicos/baba-cuidadora-infantil.jpg", fallback: "assets/servicos/baba-cuidadora-infantil.jpg" }, 
  48: { id: 48, nome: "Mecânico de Urgência", arquivo: "assets/servicos/mecanico-urgencia.jpg", fallback: "assets/servicos/mecanico-urgencia.jpg"}, 
  50: { id: 50, nome: "Instalação de Varal", arquivo: "assets/servicos/instalacao-varal.jpg", fallback: "assets/servicos/instalacao-varal.jpg"}, 
  51: { id: 51, nome: "Passeador de Cães (Dog Walker)", arquivo: "assets/servicos/passeador-caes.jpg", fallback: "assets/servicos/passeador-caes.jpg"},
  52: { id: 52, nome: "Acompanhante de Compras", arquivo: "assets/servicos/acompanhante-compras.jpg", fallback: "assets/servicos/acompanhante-compras.jpg"}, 
  53: { id: 53, nome: "Cuidador de Idosos", arquivo: "assets/servicos/cuidador-idosos.jpg", fallback: "assets/servicos/cuidador-idosos.jpg"},
  54: { id: 54, nome: "Acompanhante em Consultas", arquivo: "assets/servicos/acompanhante-consultas.jpg", fallback: "assets/servicos/acompanhante-consultas.jpg"},
  55: { id: 55, nome: "Motorista Particular", arquivo: "assets/servicos/motorista-particular.jpg", fallback: "assets/servicos/motorista-particular.jpg" },
  56: { id: 56, nome: "Jardineiro", arquivo: "assets/servicos/jardineiro.jpg", fallback: "assets/servicos/jardineiro.jpg",},
  57: { id: 57, nome: "Cozinheiro / Personal Diet", arquivo: "assets/servicos/cozinheiro-personal-diet.jpg", fallback: "assets/servicos/cozinheiro-personal-diet.jpg"}, 
  58: { id: 58, nome: "Acompanhante de Lazer", arquivo: "assets/servicos/acompanhante-lazer.jpg", fallback: "assets/servicos/acompanhante-lazer.jpg" }, 
  59: { id: 59, nome: "Frete e Carretos", arquivo: "assets/servicos/frete-carretos.jpg", fallback: "assets/servicos/frete-carretos.jpg"}, 
  60: { id: 60, nome: "Ajudante de Mudança", arquivo: "assets/servicos/ajudante-mudanca.jpg", fallback: "assets/servicos/ajudante-mudanca.jpg"}, 
  62: { id: 62, nome: "Encanador / Hidráulica", arquivo: "assets/servicos/encanador-hidraulica.jpg", fallback: "assets/servicos/encanador-hidraulica.jpg" }, 
  63: { id: 63, nome: "Pintor", arquivo: "assets/servicos/pintor.jpg", fallback: "assets/servicos/pintura.jpg" },
  64: { id: 64, nome: "Pedreiro", arquivo: "assets/servicos/pedreiro-64.jpg", fallback: "assets/servicos/pedreiro.jpg"},
  65: { id: 65, nome: "Instalação de Eletrodomésticos", arquivo: "assets/servicos/instalacao-eletrodomesticos.jpg", fallback: "assets/servicos/troca-lampadas-luminarias.jpg"}, 
  66: { id: 66, nome: "Limpeza de Estofados", arquivo: "assets/servicos/limpeza-estofados.jpg", fallback: "assets/servicos/faxina-limpeza-residencial.jpg"}, 
  67: { id: 67, nome: "Manutenção de Ar-condicionado", arquivo: "assets/servicos/manutencao-ar-condicionado.jpg", fallback: "assets/servicos/manutencao-chuveiro.jpg"},
  68: { id: 68, nome: "Chaveiro", arquivo: "assets/servicos/chaveiro.jpg", fallback: "assets/servicos/eletricista.jpg", gerada: false }, 
  69: { id: 69, nome: "Técnico em Informática", arquivo: "assets/servicos/tecnico-informatica.jpg", fallback: "assets/servicos/tecnico-em-informatica.jpg"},
  70: { id: 70, nome: "Personal Organizer", arquivo: "assets/servicos/personal-organizer.jpg", fallback: "assets/servicos/camareira.jpg"}, 
  71: { id: 71, nome: "Limpeza de Piscina", arquivo: "assets/servicos/limpeza-piscina.jpg", fallback: "assets/servicos/jardinagem.jpg"}, 
  72: { id: 72, nome: "Limpeza de Caixa D'água", arquivo: "assets/servicos/limpeza-caixa-dagua.jpg", fallback: "assets/servicos/encanador-hidraulica.jpg"}, 
  73: { id: 73, nome: "Serralheiro", arquivo: "assets/servicos/serralheiro.jpg", fallback: "assets/servicos/marcenaria.jpg", gerada: false }, 
  74: { id: 74, nome: "Gesseiro / Drywall", arquivo: "assets/servicos/gesseiro-drywall.jpg", fallback: "assets/servicos/pedreiro.jpg"}, 
  75: { id: 75, nome: "Vidraceiro", arquivo: "assets/servicos/vidraceiro.jpg", fallback: "assets/servicos/montagem-moveis.jpg"}, 
  76: { id: 76, nome: "Marceneiro", arquivo: "assets/servicos/marceneiro.jpg", fallback: "assets/servicos/marcenaria.jpg"}, 
  77: { id: 77, nome: "Instalação de Câmeras e CFTV", arquivo: "assets/servicos/instalacao-cameras-cftv.jpg", fallback: "assets/servicos/eletricista.jpg"}, 
  78: { id: 78, nome: "Suporte Técnico e Redes", arquivo: "assets/servicos/suporte-tecnico-redes.jpg", fallback: "assets/servicos/eletricista.jpg"},
  79: { id: 79, nome: "Fotografia de Eventos e Ensaios", arquivo: "assets/servicos/fotografia-eventos-ensaios.jpg", fallback: "assets/servicos/cabeleireiro-estetica.jpg"}, 
  80: { id: 80, nome: "Churrasqueiro para Eventos", arquivo: "assets/servicos/churrasqueiro-eventos.jpg", fallback: "assets/servicos/cozinheiro-personal-diet.jpg", },
  81: { id: 81, nome: "Garçom / Copeira", arquivo: "assets/servicos/garcom-copeira.jpg", fallback: "assets/servicos/camareira.jpg"}, 
  82: { id: 82, nome: "Pet Sitter / Babá de Pets", arquivo: "assets/servicos/pet-sitter-baba-pets.jpg", fallback: "assets/servicos/passeador-caes.jpg"},
};

const IMAGENS_SERVICOS_POR_NOME = {
  "faxina": "assets/servicos/faxina.jpg",
  "eletricista": "assets/servicos/eletricista.jpg",
  "jardinagem": "assets/servicos/jardinagem.jpg",
  "pintura": "assets/servicos/pintura.jpg",
  "encanador": "assets/servicos/encanador.jpg",
  "marcenaria": "assets/servicos/marcenaria.jpg",
  "pedreiro": "assets/servicos/pedreiro.jpg",
  "camareira": "assets/servicos/camareira.jpg",
  "troca de lâmpadas e luminárias": "assets/servicos/troca-lampadas-luminarias.jpg",
  "manutenção de chuveiro": "assets/servicos/manutencao-chuveiro.jpg",
  "montagem de móveis": "assets/servicos/montagem-moveis.jpg",
  "faxina / limpeza residencial": "assets/servicos/faxina-limpeza-residencial.jpg",
  "passadeira de roupa": "assets/servicos/passadeira-roupa.jpg",
  "controle de pragas": "assets/servicos/controle-pragas.jpg",
  "manicure e pedicure": "assets/servicos/manicure-pedicure.jpg",
  "cabeleireiro e estética": "assets/servicos/cabeleireiro-estetica.jpg",
  "babá / cuidadora infantil": "assets/servicos/baba-cuidadora-infantil.jpg",
  "mecânico de urgência": "assets/servicos/mecanico-urgencia.jpg",
  "instalação de varal": "assets/servicos/instalacao-varal.jpg",
  "passeador de cães (dog walker)": "assets/servicos/passeador-caes.jpg",
  "acompanhante de compras": "assets/servicos/acompanhante-compras.jpg",
  "cuidador de idosos": "assets/servicos/cuidador-idosos.jpg",
  "acompanhante em consultas": "assets/servicos/acompanhante-consultas.jpg",
  "motorista particular": "assets/servicos/motorista-particular.jpg",
  "jardineiro": "assets/servicos/jardineiro.jpg",
  "cozinheiro / personal diet": "assets/servicos/cozinheiro-personal-diet.jpg",
  "acompanhante de lazer": "assets/servicos/acompanhante-lazer.jpg",
  "frete e carretos": "assets/servicos/frete-carretos.jpg",
  "ajudante de mudança": "assets/servicos/ajudante-mudanca.jpg",
  "encanador / hidráulica": "assets/servicos/encanador-hidraulica.jpg",
  "pintor": "assets/servicos/pintura.jpg",
  "pedreiro": "assets/servicos/pedreiro.jpg",
  "instalação de eletrodomésticos": "assets/servicos/troca-lampadas-luminarias.jpg",
  "limpeza de estofados": "assets/servicos/faxina-limpeza-residencial.jpg",
  "manutenção de ar-condicionado": "assets/servicos/manutencao-chuveiro.jpg",
  "chaveiro": "assets/servicos/eletricista.jpg",
  "técnico em informática": "assets/servicos/tecnico-em-informatica.jpg",
  "personal organizer": "assets/servicos/camareira.jpg",
  "limpeza de piscina": "assets/servicos/jardinagem.jpg",
  "limpeza de caixa d'água": "assets/servicos/encanador-hidraulica.jpg",
  "serralheiro": "assets/servicos/marcenaria.jpg",
  "gesseiro / drywall": "assets/servicos/pedreiro.jpg",
  "vidraceiro": "assets/servicos/montagem-moveis.jpg",
  "marceneiro": "assets/servicos/marcenaria.jpg",
  "instalação de câmeras e cftv": "assets/servicos/eletricista.jpg",
  "suporte técnico e redes": "assets/servicos/eletricista.jpg",
  "fotografia de eventos e ensaios": "assets/servicos/cabeleireiro-estetica.jpg",
  "churrasqueiro para eventos": "assets/servicos/cozinheiro-personal-diet.jpg",
  "garçom / copeira": "assets/servicos/camareira.jpg",
  "pet sitter / babá de pets": "assets/servicos/passeador-caes.jpg",
};

/**
 * Retorna o caminho da imagem para um serviço pelo ID ou nome.
 * Por padrão (`usarFallbackSePendente = true`), retorna uma foto já existente
 * para os IDs 63..82 enquanto as últimas 20 imagens não são geradas.
 */
function obterImagemServico(servico = {}, usarFallbackSePendente = true, fallbackPadrao = "assets/servicos/faxina.jpg") {
  const item = (typeof servico === "string" || typeof servico === "number")
    ? (Number.isNaN(Number(servico)) ? { nome: String(servico) } : { id: Number(servico) })
    : (servico || {});

  const idRaw = item.id ?? item.id_servico ?? item.servico_id;
  const idNum = Number(idRaw);
  if (!Number.isNaN(idNum) && IMAGENS_SERVICOS_POR_ID[idNum]) {
    const entry = IMAGENS_SERVICOS_POR_ID[idNum];
    return (entry.gerada || !usarFallbackSePendente) ? entry.arquivo : entry.fallback;
  }

  const nomeRaw = item.nome ?? item.servico ?? item.titulo ?? "";
  const nomeKey = String(nomeRaw).trim().toLowerCase();
  if (nomeKey && IMAGENS_SERVICOS_POR_NOME[nomeKey]) {
    return IMAGENS_SERVICOS_POR_NOME[nomeKey];
  }

  return fallbackPadrao;
}

/**
 * Aplica as imagens nos cards de serviços da página (catálogo e 'Escolher Serviços').
 */
function aplicarImagensServicosNoDOM(root = document) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  const cards = root.querySelectorAll(
    "[data-servico-id], [data-id-servico], [data-servico-nome], [data-servico], .servico-card, .card-servico, .service-card"
  );
  cards.forEach((card) => {
    const id = card.getAttribute("data-servico-id") || card.getAttribute("data-id-servico") || card.dataset?.servicoId || card.dataset?.idServico || "";
    const nome = card.getAttribute("data-servico-nome") || card.getAttribute("data-servico") || card.querySelector("h3, h4, .servico-nome, .card-title")?.textContent?.trim() || "";
    const url = obterImagemServico({ id, nome }, true);
    const img = card.tagName === "IMG" ? card : card.querySelector("img");
    if (img) {
      if (img.getAttribute("src") !== url) img.setAttribute("src", url);
      if (!img.getAttribute("alt") && nome) img.setAttribute("alt", nome);
      img.onerror = function () {
        this.onerror = null;
        this.src = "assets/servicos/faxina.jpg";
      };
    }
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => aplicarImagensServicosNoDOM(document));
  } else {
    aplicarImagensServicosNoDOM(document);
  }
}

if (typeof window !== "undefined") {
  window.IMAGENS_SERVICOS_POR_ID = IMAGENS_SERVICOS_POR_ID;
  window.IMAGENS_SERVICOS_POR_NOME = IMAGENS_SERVICOS_POR_NOME;
  window.obterImagemServico = obterImagemServico;
  window.aplicarImagensServicosNoDOM = aplicarImagensServicosNoDOM;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    IMAGENS_SERVICOS_POR_ID,
    IMAGENS_SERVICOS_POR_NOME,
    obterImagemServico,
    aplicarImagensServicosNoDOM
  };
}
