// Reglas para valorar cualquier té con leche a partir de su nombre, tipo e ingredientes.
// Se usan para los tés de Tea Shop, los clásicos sin valoración manual y el analizador libre.
(() => {
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

  // Texto para las reglas: `f` sin tildes y `o` original, con las mismas posiciones.
  function mk(s) {
    const o = String(s ?? "").toLowerCase().normalize("NFC");
    let f = "";
    for (const c of o) {
      const d = c.normalize("NFD").replace(/[̀-ͯ]/g, "");
      f += d.length === 1 && /[a-z0-9]/.test(d) ? d : " ".repeat(c.length);
    }
    return { f, o };
  }

  // Devuelve la palabra completa (con sus tildes) encontrada para cada raíz.
  function has(text, words) {
    const out = [];
    for (const w of words) {
      const m = new RegExp("\\b" + w.replace(/ /g, "\\s+") + "\\w*").exec(text.f);
      const word = m && text.o.slice(m.index, m.index + m[0].length);
      if (word && !out.includes(word)) out.push(word);
    }
    return out;
  }

  const BASES = {
    matcha:   [5, "Base de matcha: perfecta para matcha latte.", "Té Matcha"],
    chai:     [5, "Té con especias estilo chai: pensado para tomar con leche.", "Té Chai"],
    hojicha:  [5, "Hojicha (verde tostado): notas de caramelo, ideal en latte.", "Té Verde"],
    negro:    [4, "Base de té negro: tiene cuerpo y taninos que la leche suaviza.", "Té Negro"],
    rooibos:  [4, "Base de rooibos: dulce y sin amargor, admite bien la leche.", "Rooibos"],
    "pu-erh": [3, "Pu-Erh: terroso; con leche funciona, sobre todo con notas dulces.", "Té Rojo (Pu Erh)"],
    mate:     [3, "Yerba mate: el 'mate cocido con leche' es una tradición.", "Mate"],
    oolong:   [2, "Oolong: según el tueste admite algo de leche, mejor en frío.", "Té Oolong (azul)"],
    infusion: [2, "Infusión de hierbas o frutas: depende mucho de los ingredientes.", "Infusión"],
    verde:    [1, "Base de té verde: vegetal y delicado, la leche no le suele ir bien.", "Té Verde"],
    blanco:   [0, "Té blanco: demasiado delicado para la leche.", "Té Blanco"],
  };

  // Palabras que delatan el tipo de té (español, inglés y nombres/marcas habituales).
  const BASE_HINTS = [
    ["matcha", /\bmatcha\b/],
    ["hojicha", /\b(hojicha|houjicha)\b/],
    ["chai", /\b(chai|masala|karak|chay)\b/],
    ["rooibos", /\b(rooibos|roibos|redbush|honeybush)\b/],
    ["pu-erh", /\b(pu ?erh|puerh|pu er|shou|sheng|tuocha|te rojo|red tea)\b/],
    ["oolong", /\b(oolong|wulong|tie ?guan ?yin|tie kuan yin|da hong pao|dong ding|dan cong|alishan|milky)\b/],
    ["blanco", /\b(te blanco|white tea|pai mu tan|bai mu dan|silver needle|bai hao|shou mei|te amarillo|yellow tea)\b/],
    ["verde", /\b(te verde|green tea|sencha|gyokuro|bancha|kukicha|genmaicha|gunpowder|lung ching|long jing|mao feng|bi luo chun|jasmine|jazmin|matcha cake|moruno|marroqui)\b/],
    ["mate", /\b(mate|yerba|guayusa)\b/],
    ["negro", /\b(te negro|black tea|assam|ceylon|ceilan|darjeeling|kenya|kenia|keemun|yunnan|lapsang|nilgiri|breakfast|desayuno|earl grey|lady grey|english|irish|scottish|russian|afternoon|prince of wales|builder|orange pekoe|pekoe|fbop|bop|ctc|thai|hong kong|royal milk|london fog|teh tarik|ostfries|frisian|caravan|rize|turco|cay)\b/],
    ["infusion", /\b(infusion|tisana|achicoria|chicory|cereales solubles|herbal|manzanilla|camomila|chamomile|menta|peppermint|mint|poleo|tila|linden|valeriana|hibisco|hibiscus|frutas|fruit|frutos|berries|jengibre|ginger|curcuma|turmeric|golden|lavanda|lavender|hierba luisa|verbena|melisa|cacao|cocoa|canela|cinnamon|regaliz|liquorice|licorice|hinojo|fennel|anis|eucalipto|moringa|mugicha|cebada|barley|butterfly|clitoria|cola de caballo|ortiga|salvia|romero|tomillo|lemon|limon|horchata)\b/],
  ];

  // `teina: false` = el fabricante indica "sin teína" (no puede ser té negro/verde...).
  function detectBase({ nombre = "", tipo = "", ingredientes = "", tags = [], teina }) {
    const name = norm(nombre), t = norm(tipo), ing = norm(ingredientes);
    // Primer ingrediente: hasta la primera coma, o las 4 primeras palabras si no hay comas.
    const first = /,/.test(ingredientes) ? norm(ingredientes.split(",")[0]) : ing.split(" ").slice(0, 4).join(" ");
    const tg = norm(tags.join(" "));
    if (/\bmatcha\b/.test(name) && (/matcha|polvo/.test(t + " " + first) || /latte|polvo/.test(name) || !first)) return "matcha";
    if (/\bhojicha\b/.test(name)) return "hojicha";
    if (teina === true && /\bte rojo\b/.test(name)) return "pu-erh"; // "té rojo" con teína es pu-erh, no rooibos
    if (/\bchai\b/.test(name) && !/\b(rooibos|matcha|pu ?erh)\b/.test(name + " " + first)) return "chai";
    if (/\bchai\b/.test(tg) && /\bte negro\b/.test(t + " " + first)) return "chai";
    // 1º el tipo declarado, 2º el primer ingrediente, 3º pistas en el nombre.
    for (const src of [t, first, name]) {
      if (!src) continue;
      for (const [key, re] of BASE_HINTS) if (key !== "infusion" && re.test(src)) return key;
      if (/\b(infusi|herbolario|tisana)/.test(src)) return "infusion";
    }
    for (const [key, re] of BASE_HINTS) if (re.test(name)) return key;
    if (teina === false) return /\brooibos\b/.test(ing) ? "rooibos" : "infusion";
    // Marcas que casi siempre venden té negro: la pista más débil.
    if (/\b(yorkshire|pg tips|tetley|lipton|yellow label|hornimans|twinings|ahmad|dilmah|clipper|typhoo)\b/.test(name)) return "negro";
    if (/\bte negro\b/.test(ing)) return "negro";
    if (/\brooibos\b/.test(ing)) return "rooibos";
    if (/\bte verde\b/.test(ing)) return "verde";
    return null; // desconocido
  }

  const CREAMY = [
    "vainilla", "vanill", "caramel", "chocolate", "choco", "cacao", "cocoa", "canela", "cinnamon", "cardamom",
    "almendra", "almond", "avellana", "hazelnut", "pistach", "coco\\b", "coconut", "galleta", "biscuit", "cookie",
    "tarta", "cake", "torrija", "toffee", "pralin", "nuez", "nueces", "nut\\b", "nutty", "crema", "cream",
    "cremos", "latte", "curcuma", "turmeric", "dulce de leche", "algarroba", "tiramisu", "tearamisu",
    "platano", "banana", "calabaza", "pumpkin", "brownie", "cheesecake", "nata", "malta", "malt", "miel",
    "honey", "regaliz", "liquorice", "licorice", "jengibre", "ginger", "clavo", "clove", "especia", "spice",
    "spicy", "turron", "mazapan", "marzipan", "castana", "chestnut", "bizcocho", "macadamia", "maple", "achicoria", "chicory", "cebada", "barley",
    "arce", "butter", "mantequilla", "horchata", "chufa", "pecan", "muffin", "pastel", "dessert", "postre",
];
  // Fruta ácida en trozos: puede cortar la leche.
  const ACID = [
    "maracuya", "pina\\b", "pineapple", "fresa", "strawberr", "frambuesa", "raspberr", "mora\\b", "blackberr",
    "frutos rojos", "frutos del bosque", "berries", "berry", "granada", "pomegranate", "cereza", "cherr",
    "arandano", "cranberr", "blueberr", "grosella", "currant", "rosa mosqueta", "rosehip", "acidulante",
    "acido citrico", "kiwi", "fruta de la pasion", "passion", "ruibarbo", "rhubarb", "guayaba", "guava", "goji",
  ];
  // Cítricos (normalmente piel o aroma): chocan algo pero no cortan la leche.
  const CITRUS = ["limon", "lemon\\b", "lima\\b", "lime\\b", "naranja", "orange\\b", "pomelo", "grapefruit",
    "mandarina", "tangerine", "yuzu", "hierba limon", "lemongrass"];
  const MILD_FRUIT = ["manzana", "apple", "melon", "sandia", "watermelon", "uva", "papaya", "mango", "melocoton", "peach"];
  const NO_MILK = ["hibisco", "hibiscus", "menta", "mint", "peppermint", "jazmin", "jasmine", "eucalipto",
    "eucalyptus", "tila", "linden", "valeriana", "poleo", "ortiga", "nettle"];

  const VERDICT = ["No mezclar con leche", "Mejor sin leche", "Admite un poco de leche",
    "Bueno con leche", "Muy bueno con leche", "Perfecto con leche"];

  function analyze(tea) {
    const base = tea.base || detectBase(tea);
    if (!base) return null;
    const [b, baseReason] = BASES[base];
    let score = b;
    const razones = [baseReason];
    const text = mk([tea.nombre, tea.ingredientes, tea.sabor].join(" "));
    const t = text.f;
    const desc = norm(tea.descripcion);
    const sabor = norm(tea.sabor);
    const name = norm(tea.nombre);
    const list = (w, n) => w.slice(0, n).join(", ");

    const creamy = has(text, CREAMY);
    if (creamy.length && base !== "blanco") {
      let bonus = Math.min(2, 0.75 * creamy.length);
      if (base === "verde" || base === "oolong") bonus = Math.min(bonus, 1);
      score += bonus;
      razones.push(`Notas que combinan con la leche: ${list(creamy, 5)}.`);
    }
    const strong = has(text, ACID);
    if (strong.length) {
      score -= Math.min(2.5, 0.8 * strong.length);
      razones.push(`Lleva fruta ácida (${list(strong, 4)}): puede cortar la leche o chocar con ella.`);
    }
    const citrus = has(text, CITRUS);
    if (citrus.length) {
      score -= Math.min(1, 0.4 * citrus.length);
      if (base === "infusion" || base === "verde") {
        // Aquí el cítrico es protagonista (no un simple aroma): corta la leche.
        score = Math.min(score - 1, 1);
        razones.push(`Lleva cítricos (${list(citrus, 3)}) como ingrediente principal: cortan la leche.`);
      } else {
        razones.push(`Notas cítricas (${list(citrus, 3)}): con leche, mejor poca cantidad.`);
      }
    }
    if (!strong.length && has(text, MILD_FRUIT).length && (base === "infusion" || base === "verde")) score -= 0.5;

    if (/\bearl grey\b/.test(name)) {
      score += 1;
      razones.push("La bergamota del Earl Grey combina muy bien con leche (London Fog).");
    }
    if (/\bdarjeeling\b/.test(t)) {
      score = Math.min(score, /first\s+flush/.test(t) ? 2 : 3);
      razones.push("Darjeeling: delicado y floral; la leche tapa sus matices.");
    }
    const nomilk = has(text, NO_MILK);
    const hib = nomilk.some((w) => w.startsWith("hibis")) && !/hibisco\s+blanco/.test(t);
    if (hib) {
      const dessert = ["negro", "pu-erh", "rooibos"].includes(base) && creamy.length > 0;
      score = Math.min(score, dessert ? 2 : 1);
      razones.push("Lleva hibisco: es muy ácido y puede cortar la leche." +
        (dessert ? " Aquí va en poca cantidad, así que con un chorrito puede funcionar." : ""));
    }
    const others = nomilk.filter((w) => !w.startsWith("hibis"));
    if (others.length) {
      score -= base === "negro" || base === "pu-erh" ? 0.5 : 1;
      razones.push(`Notas frescas o florales (${list(others, 4)}) que no casan bien con la leche.`);
    }
    if (base === "infusion" && !creamy.length) {
      score -= 1;
      if (/manzanilla|camomil|chamomile/.test(t)) {
        score += 1.5;
        razones.push("La manzanilla con leche y miel es una bebida tradicional para dormir.");
      }
    }
    if (/\b(leche|latte|milk)\b/.test(desc)) {
      score += 1;
      razones.push(`${tea.fuente === "Tea Shop" ? "Tea Shop" : "El fabricante"} lo recomienda con leche o en latte.`);
    }
    if (/cremoso|especiado/.test(sabor)) score += 0.5;
    if (base !== "negro" && /citrico|afrutado|acido|mentolado|floral|refrescante/.test(sabor)) score -= 0.5;

    score = Math.round(Math.max(0, Math.min(5, score)));
    return {
      base, tipo: BASES[base][2], score, veredicto: VERDICT[score], razones,
      metodos: metodosFor(base, score, text), leche: lecheFor(base, score, text),
    };
  }

  function metodosFor(base, score, text) {
    if (score <= 1) return [];
    if (base === "matcha") return ["matcha-latte", "iced-latte"];
    if (base === "chai") return ["cocido", "latte", "iced-latte"];
    if (base === "hojicha") return ["latte", "iced-latte"];
    if (/\bthai\b/.test(text.f)) return ["iced-latte", "hk"];
    if (base === "negro") {
      if (/earl\s+grey/.test(text.f)) return ["latte", "ingles", "iced-latte"];
      const m = has(text, ["canela", "cinnamon", "jengibre", "ginger", "cardamom", "clavo", "clove", "especia", "spice", "pimienta"]).length
        ? ["cocido", "ingles"] : ["ingles"];
      if (has(text, ["vainilla", "vanill", "bergamota", "caramel", "chocolate", "cacao", "coco", "cream", "crema"]).length) m.push("latte");
      return [...m, "iced-latte"];
    }
    if (base === "rooibos") return score >= 4 ? ["latte", "infusion-leche", "iced-latte"] : ["latte", "iced-latte"];
    if (base === "pu-erh") return has(text, CREAMY).length ? ["latte", "ingles"] : score >= 3 ? ["ingles", "hk"] : ["ingles"];
    if (base === "mate") return ["infusion-leche"];
    if (base === "oolong" || base === "verde") return ["iced-latte"];
    return score >= 4 ? ["infusion-leche", "latte"] : ["latte"];
  }

  function lecheFor(base, score, text) {
    if (score <= 1) return "No recomendada.";
    if (has(text, ACID).length || /hibis/.test(text.f))
      return "Si la pruebas con leche, usa avena (aguanta mejor la acidez) y añádela templada. Evita la soja: se corta con facilidad.";
    if (base === "chai") return "Entera o avena barista. Un poco de azúcar o miel potencia las especias.";
    if (base === "matcha") return "Avena, entera o soja.";
    if (base === "rooibos" || base === "infusion") return "Avena, almendra o entera: las dulces van genial con este perfil.";
    if (base === "negro") return "Entera o semidesnatada; avena si te gusta más dulce.";
    return "Entera o avena.";
  }

  // Para tés con valoración manual: métodos por defecto a partir del tipo y el nombre.
  const defaultMethods = (base, score, nombre) => metodosFor(base, score, mk(nombre));
  const defaultMilk = (base, score, nombre) => lecheFor(base, score, mk(nombre));

  // Temperatura (ºC) y minutos orientativos sin leche, por tipo.
  const BREW = {
    negro: [95, "3-5"], chai: [100, "5"], rooibos: [100, "6-8"], "pu-erh": [95, "3-5"], oolong: [90, "3"],
    verde: [80, "2-3"], blanco: [80, "4-5"], matcha: [75, "batido"], hojicha: [95, "3"], mate: [80, "4"], infusion: [95, "5-7"],
  };

  window.RULES = { norm, analyze, detectBase, defaultMethods, defaultMilk, BASES, VERDICT, BREW };
})();
