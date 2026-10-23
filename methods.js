// Métodos de preparación con leche. {T} = temperatura del agua, {M+n} = minutos de infusión + n.
window.METHODS = {
  ingles: {
    nombre: "Clásico británico",
    sub: "Té fuerte + leche fría al final",
    pasos: [
      "Hierve el agua y déjala a {T}ºC.",
      "Pon algo más de té de lo normal: unos 3 g por cada 200 ml (una cucharadita bien colmada) o 2 bolsitas para una taza grande.",
      "Infusiona {M+1} min, un minuto más de lo habitual para que la leche no lo deje aguado.",
      "Retira las hojas o las bolsitas, añade 30-50 ml de leche fría y remueve.",
    ],
    tip: "Primero el té, luego la leche: así el agua llega bien caliente a las hojas y controlas cuánta leche pones.",
  },
  latte: {
    nombre: "Tea latte",
    sub: "Concentrado + leche caliente espumada",
    pasos: [
      "Prepara un concentrado: 4 g de té (o 2 bolsitas) en 100 ml de agua a {T}ºC durante {M+1} min.",
      "Mientras, calienta 150 ml de leche a 60-65ºC (que humee, sin llegar a hervir) y espúmala.",
      "Cuela el concentrado en la taza, vierte la leche y corona con la espuma.",
      "Endulza al gusto: miel, azúcar moreno o sirope de vainilla.",
    ],
    tip: "Sin espumador: agita la leche caliente en un tarro bien cerrado durante 30 s, o bombea con una prensa francesa.",
    micro: {
      pasos: [
        "Prepara un concentrado: 4 g de té (o 2 bolsitas) en 100 ml de agua a {T}ºC durante {M+1} min.",
        "Mientras, pon 150 ml de leche en una taza apta para microondas y caliéntala en tandas de 30 s, removiendo entre una y otra, hasta que humee (1-1,5 min a potencia alta). Que no llegue a subir.",
        "Espúmala, cuela el concentrado en la taza, vierte la leche y corona con la espuma.",
        "Endulza al gusto: miel, azúcar moreno o sirope de vainilla.",
      ],
      tip: "Truco: calienta la leche en un tarro sin tapa, ciérralo (con un paño, quema) y agítalo 30 s. Sale una espuma muy decente.",
    },
  },
  cocido: {
    nombre: "Chai cocido en cazo",
    sub: "Agua + té hirviendo, luego la leche",
    pasos: [
      "En un cazo pon 150 ml de agua y 5 g de té (2 cucharaditas o 2-3 bolsitas abiertas). Si quieres más intensidad, añade canela, jengibre fresco o cardamomo machacado.",
      "Lleva a ebullición y deja hervir suave 3-4 min.",
      "Añade 150 ml de leche (y azúcar o miel si quieres) y deja que vuelva a subir casi hasta hervir.",
      "Cuando suba la espuma, baja el fuego; repítelo 2 veces. Cuela y sirve.",
    ],
    tip: "Aquí sí se calienta la leche junto con el té: es lo que da el sabor redondo y tostado del chai indio.",
    micro: {
      nombre: "Chai en taza (microondas)",
      sub: "Té en agua hervida, luego la leche con las hojas",
      pasos: [
        "Pon 5 g de té (2 cucharaditas o 2-3 bolsitas abiertas) en una taza grande o jarra apta para microondas. Si quieres especias, mejor molidas (canela, jengibre, cardamomo): sueltan el sabor más rápido.",
        "Vierte 150 ml de agua recién hervida, tapa con un plato y deja 5 min: un poco más que en cazo, porque aquí no llega a cocer.",
        "Añade 150 ml de leche (y azúcar o miel si quieres), sin colar, y calienta en tandas de 30 s removiendo entre medias hasta que esté muy caliente (unos 1,5-2 min).",
        "Tapa, deja reposar 2 min más, cuela y sirve.",
      ],
      tip: "No queda tan tostado como en cazo, pero calentar la leche con las hojas dentro le da casi el mismo cuerpo. Usa un recipiente grande y vigila: en el microondas la leche sube de golpe.",
    },
  },
  "infusion-leche": {
    nombre: "Infusión en leche",
    sub: "Las hojas directamente en leche caliente",
    pasos: [
      "Lleva 80 ml de agua a {T}ºC, añade 4 g de la mezcla (o 2 bolsitas) y deja 3 min para que se abran las hojas.",
      "Mientras, calienta 200 ml de leche hasta 80-85ºC (burbujitas en el borde, sin hervir).",
      "Vierte la leche sobre el té, tapa y deja infusionar {M} min más.",
      "Cuela y endulza si quieres.",
    ],
    tip: "La leche extrae el sabor más despacio que el agua; por eso primero se 'despiertan' las hojas con un poco de agua.",
    micro: {
      pasos: [
        "Lleva 80 ml de agua a {T}ºC, añade 4 g de la mezcla (o 2 bolsitas) en una taza grande y deja 3 min para que se abran las hojas.",
        "Añade 200 ml de leche fría a la taza, con las hojas dentro.",
        "Calienta en tandas de 30 s, removiendo, hasta que salgan burbujitas en el borde (unos 2 min a potencia alta). Sin que llegue a hervir.",
        "Tapa con un plato, deja infusionar {M} min más, cuela y endulza si quieres.",
      ],
      tip: "Al calentar la leche junto con las hojas extrae algo más de sabor que vertiéndola caliente, así que no hace falta alargar la infusión.",
    },
  },
  "matcha-latte": {
    nombre: "Matcha latte",
    sub: "Matcha batido + leche",
    pasos: [
      "Tamiza 2 g (1 cucharadita) de matcha en un bol o taza.",
      "Añade 50 ml de agua a 75-80ºC. Nunca hirviendo: amarga.",
      "Bate en zigzag con varilla (chasen) o espumador hasta que no queden grumos.",
      "Calienta y espuma 180 ml de leche a 60-65ºC y viértela encima. Versión fría: leche fría sobre hielo y el matcha por encima.",
    ],
    tip: "Una pizca de sal o un poco de miel realza el dulzor del matcha.",
    micro: {
      pasos: [
        "Tamiza 2 g (1 cucharadita) de matcha en un bol o taza.",
        "Añade 50 ml de agua a 75-80ºC (hierve el agua y déjala reposar 3-4 min). Nunca hirviendo: amarga.",
        "Bate en zigzag con varilla (chasen) o espumador hasta que no queden grumos.",
        "Calienta 180 ml de leche en el microondas en tandas de 30 s hasta que humee (1-1,5 min), espúmala y viértela encima. Versión fría: leche fría sobre hielo y el matcha por encima.",
      ],
      tip: "Una pizca de sal o un poco de miel realza el dulzor del matcha.",
    },
  },
  "iced-latte": {
    nombre: "Latte frío",
    sub: "Concentrado doble sobre hielo y leche",
    pasos: [
      "Concentrado doble: 6 g de té (o 3 bolsitas) en 150 ml de agua a {T}ºC durante {M+1} min.",
      "Cuela y endulza ahora, en caliente (en frío el azúcar no se disuelve).",
      "Llena un vaso de hielo, vierte el concentrado y completa con 100 ml de leche fría.",
    ],
    tip: "Cold brew: 8 g de té en 500 ml de agua fría, 8-12 h en la nevera. Sale más suave y dulce. Para bubble tea, añade perlas de tapioca.",
  },
  hk: {
    nombre: "Estilo Hong Kong",
    sub: "Té muy fuerte + leche evaporada",
    pasos: [
      "Hierve 250 ml de agua con 8 g de té negro (o 4 bolsitas) y deja a fuego bajo 5-6 min.",
      "Cuela varias veces pasándolo de un recipiente a otro (o por un colador de tela): queda más sedoso.",
      "Pon 50-60 ml de leche evaporada en la taza y vierte el té encima.",
      "Azúcar al gusto. Con leche condensada en vez de evaporada y sobre hielo, tienes el estilo tailandés.",
    ],
    tip: "La leche evaporada es la clave: más cremosa y concentrada que la normal.",
    micro: {
      pasos: [
        "Pon 8 g de té negro (o 4 bolsitas) en una jarra, vierte 250 ml de agua recién hervida y tapa.",
        "Deja 4 min, calienta la jarra 1 min en el microondas para que vuelva a estar muy caliente y deja 3 min más tapada.",
        "Cuela varias veces pasándolo de un recipiente a otro (o por un colador de tela): queda más sedoso.",
        "Pon 50-60 ml de leche evaporada en la taza y vierte el té encima. Azúcar al gusto. Con leche condensada y sobre hielo, tienes el estilo tailandés.",
      ],
      tip: "El original se cuece a fuego lento; recalentarlo a mitad de infusión imita ese té tan intenso. La leche evaporada no hace falta calentarla.",
    },
  },
  royal: {
    nombre: "Royal milk tea japonés",
    sub: "Poca agua, mucha leche, en cazo",
    pasos: [
      "Hierve 80 ml de agua en un cazo, apaga, añade 5 g de té (o 2-3 bolsitas), tapa y deja 3 min.",
      "Añade 200 ml de leche y calienta a fuego medio hasta justo antes de hervir.",
      "Apaga, tapa 1 min más, cuela y endulza.",
    ],
    tip: "Usa un té negro con cuerpo (Assam, Ceilán, Breakfast).",
    micro: {
      pasos: [
        "Pon 5 g de té (o 2-3 bolsitas) en una taza grande, vierte 80 ml de agua recién hervida, tapa y deja 3 min.",
        "Añade 200 ml de leche, sin colar, y calienta en tandas de 30 s, removiendo, hasta que esté a punto de hervir (unos 2 min).",
        "Tapa 1 min más, cuela y endulza.",
      ],
      tip: "Usa un té negro con cuerpo (Assam, Ceilán, Breakfast) y una taza grande: la leche sube de golpe en el microondas.",
    },
  },
};

window.GUIDE = `
<h2>Guía rápida del té con leche</h2>

<h3>¿Qué tés van bien con leche?</h3>
<p>Los que tienen <b>cuerpo y taninos</b> (té negro tipo Assam, Breakfast, Kenia), los <b>especiados</b> (chai), los <b>dulces o tostados</b> (rooibos de postre, hojicha, oolong tostado, cacao) y el <b>matcha</b>.</p>
<p>Los que <b>no</b>: tés verdes y blancos delicados, infusiones de menta y, sobre todo, las <b>afrutadas ácidas</b> (hibisco, frutos rojos, limón), porque cortan la leche.</p>

<h3>¿Leche primero o después?</h3>
<p>Con té en taza, <b>primero el té y después la leche</b>: el agua llega bien caliente a las hojas y controlas la cantidad. Solo en el chai cocido y el royal milk tea se calienta la leche junto con el té.</p>

<h3>¿Leche fría o caliente?</h3>
<ul>
  <li><b>Fría</b>: en el clásico británico (un chorrito, 30-50 ml). Enfría un poco el té, que se bebe enseguida.</li>
  <li><b>Caliente y espumada (60-65ºC)</b>: en lattes. Más de 70ºC quema la leche y pierde dulzor.</li>
  <li><b>Hirviendo con el té</b>: solo en chai y royal milk tea, en cazo.</li>
</ul>

<h3>¿Solo tienes microondas?</h3>
<p>Sin problema. El agua hiérvela como siempre (hervidor o microondas) y la leche caliéntala en el microondas <b>en tandas de 30 s, removiendo</b> entre una y otra, en una taza grande: la leche sube de golpe. En la ficha de cada té, elige <b>Solo microondas</b> y verás los pasos adaptados. El chai y el royal milk tea no quedan igual que en cazo, pero calentar la leche con las hojas dentro se acerca mucho.</p>

<h3>Haz el té más fuerte</h3>
<p>La leche diluye: usa un 50% más de té o un minuto más de infusión. Ojo: más tiempo también da más amargor, así que mejor más té que muchos más minutos.</p>

<h3>¿Qué leche uso?</h3>
<ul>
  <li><b>Entera</b>: la más cremosa y neutra.</li>
  <li><b>Avena</b> (mejor la "barista"): dulce, espuma bien, perfecta con chai y rooibos.</li>
  <li><b>Almendra / coco</b>: geniales con tés de postre.</li>
  <li><b>Soja</b>: espuma muy bien pero se corta fácil con la acidez o el calor fuerte. Añádela templada y despacio.</li>
  <li><b>Evaporada / condensada</b>: estilos Hong Kong y tailandés.</li>
</ul>

<h3>¿Por qué se me corta la leche?</h3>
<p>Por la acidez (frutas, cítricos, hibisco) y el calor. Soluciones: deja templar el té 1-2 min antes de añadir la leche, usa leche más grasa o avena, y evita mezclar con infusiones frutales.</p>

<h3>Dosis orientativas</h3>
<p>1 cucharadita colmada ≈ 2-3 g de té en hoja. Para té con leche: 3 g por cada 200 ml.</p>
`;
