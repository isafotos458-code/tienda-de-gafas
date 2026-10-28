// ============================================================
// PRODUCTOS DE LA ÓPTICA
// ------------------------------------------------------------
// - "img": ruta local de la foto del producto
// - "id": único para cada producto
// ============================================================

const PRODUCTS = [
  // Anteojos Recetados (Originales + 14 productos nuevos agregados)
  {
    id: "ar-001",
    categoria: "Recetados",
    nombre: "Montura Clásica Carey",
    descripcion: "Marco acetato, forma rectangular, unisex.",
    precio: 45000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (1).jpeg"
  },
  {
    id: "ar-002",
    categoria: "Recetados",
    nombre: "Montura Metal Redonda",
    descripcion: "Marco metálico liviano, estilo vintage.",
    precio: 38000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (2).jpeg"
  },
  {
    id: "ar-003",
    categoria: "Recetados",
    nombre: "Montura Cuadrada Negra",
    descripcion: "Acetato mate, ideal para uso diario.",
    precio: 42000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (3).jpeg"
  },
  {
    id: "ar-004",
    categoria: "Recetados",
    nombre: "Montura Transparente Modern",
    descripcion: "Marco de cristal de acetato, ultraliviano.",
    precio: 46000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (4).jpeg"
  },
  {
    id: "ar-005",
    categoria: "Recetados",
    nombre: "Montura Semi-al-Aire Metal",
    descripcion: "Estilo ejecutivo, marco superior en titanio.",
    precio: 49000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (5).jpeg"
  },
  {
    id: "ar-006",
    categoria: "Recetados",
    nombre: "Montura Ojo de Gato Retro",
    descripcion: "Diseño elegante con detalles dorados en patillas.",
    precio: 44000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (6).jpeg"
  },
  {
    id: "ar-007",
    categoria: "Recetados",
    nombre: "Montura Octagonal Minimalista",
    descripcion: "Forma geométrica moderna en metal dorado.",
    precio: 41000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (7).jpeg"
  },
  {
    id: "ar-008",
    categoria: "Recetados",
    nombre: "Montura Flexible Niño/Adulto",
    descripcion: "Material irrompible de alta resistencia.",
    precio: 35000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (8).jpeg"
  },
  {
    id: "ar-009",
    categoria: "Recetados",
    nombre: "Montura Bicolor Azul/Plata",
    descripcion: "Combinación de acetato frontal y patillas metálicas.",
    precio: 43000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM (9).jpeg"
  },
  {
    id: "ar-010",
    categoria: "Recetados",
    nombre: "Montura Ovalada Clip-On",
    descripcion: "Incluye accesorio magnético polarizado de sol.",
    precio: 55000,
    img: "images/WhatsApp Image 2026-10-16 at 7.06.13 PM.jpeg"
  },
  // Nuevos 14 recetados sumados:
  {
  id: "ar-001",
    categoria: "Recetados",
    nombre: "BARI RX",
    descripcion: "Armazón liviano de acetato clásico.",
    precio: 45000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.31 AM.jpeg"
  },
  {
    id: "ar-002",
    categoria: "Recetados",
    nombre: "CAPRI RX",
    descripcion: "Diseño moderno y resistente.",
    precio: 48000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.31 AM (1).jpeg"
  },
  {
    id: "ar-003",
    categoria: "Recetados",
    nombre: "NAPOLES RX",
    descripcion: "Estilo elegante con acabado mate.",
    precio: 52000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.32 AM.jpeg"
  },
  {
    id: "ar-004",
    categoria: "Recetados",
    nombre: "MODENA RX",
    descripcion: "Armazón ergonómico de alta durabilidad.",
    precio: 46000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.32 AM (1).jpeg"
  },
  {
    id: "ar-005",
    categoria: "Recetados",
    nombre: "MILAN",
    descripcion: "Forma sofisticada y confort diario.",
    precio: 49000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.32 AM (2).jpeg"
  },
  {
    id: "ar-006",
    categoria: "Recetados",
    nombre: "CALABRIA",
    descripcion: "Estructura ultraliviana estilo profesional.",
    precio: 51000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.32 AM (3).jpeg"
  },
  {
    id: "ar-007",
    categoria: "Recetados",
    nombre: "VERONA",
    descripcion: "Diseño atemporal de gran adaptabilidad.",
    precio: 47000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.32 AM (4).jpeg"
  },
  {
    id: "ar-008",
    categoria: "Recetados",
    nombre: "MAR",
    descripcion: "Armazón reforzado e hipoalergénico.",
    precio: 53000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.32 AM (5).jpeg"
  },
  {
    id: "ar-009",
    categoria: "Recetados",
    nombre: "AZUL",
    descripcion: "Líneas finas con ajuste perfecto.",
    precio: 50000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.33 AM.jpeg"
  },
  {
    id: "ar-010",
    categoria: "Recetados",
    nombre: "ALMENDRA RX",
    descripcion: "Estilo urbano con detalles de precisión.",
    precio: 54000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.33 AM (1).jpeg"
  },
  {
    id: "ar-011",
    categoria: "Recetados",
    nombre: "PIA",
    descripcion: "Armazón flexible para uso prolongado.",
    precio: 48500,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.33 AM (2).jpeg"
  },
  {
    id: "ar-012",
    categoria: "Recetados",
    nombre: "MERY",
    descripcion: "Perfil estilizado de alto rendimiento.",
    precio: 52500,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.33 AM (3).jpeg"
  },
  {
    id: "ar-013",
    categoria: "Recetados",
    nombre: "CAMILA",
    descripcion: "Diseño minimalista de vanguardia.",
    precio: 55000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.33 AM (4).jpeg"
  },
  {
    id: "ar-014",
    categoria: "Recetados",
    nombre: "IBIZA",
    descripcion: "Armazón exclusivo con acabado prémium.",
    precio: 56000,
    img: "images/WhatsApp Image 2026-10-21 at 3.02.34 AM.jpeg"
  },

  // Anteojos de Sol (Categoría: "Lentes de Sol")
  {
    id: "so-001",
    categoria: "Lentes de Sol",
    nombre: "Sol Aviador Clásico",
    descripcion: "Lentes polarizados, protección UV400.",
    precio: 52000,
    img: "images/WhatsApp Image 2026-10-19 at 2.03.22 AM (1).jpeg"
  },
  {
    id: "so-002",
    categoria: "Lentes de Sol",
    nombre: "Sol Cat-Eye",
    descripcion: "Marco acetato con lentes degradé.",
    precio: 47000,
    img: "images/WhatsApp Image 2026-10-19 at 2.03.22 AM (2).jpeg"
  },
  {
    id: "so-003",
    categoria: "Lentes de Sol",
    nombre: "Sol Deportivo",
    descripcion: "Marco flexible, ideal para actividad física.",
    precio: 39000,
    img: "images/WhatsApp Image 2026-10-19 at 2.03.22 AM.jpeg"
  },
  {
    id: "so-004",
    categoria: "Lentes de Sol",
    nombre: "Sol Wayfarer Legend",
    descripcion: "Marco negro mate con cristal verde oscuro.",
    precio: 50000,
    img: "images/WhatsApp Image 2026-10-19 at 2.06.40 AM (1).jpeg"
  },
  {
    id: "so-005",
    categoria: "Lentes de Sol",
    nombre: "Sol Espejados Azul",
    descripcion: "Cristales espejados con filtro antireflejo.",
    precio: 48000,
    img: "images/WhatsApp Image 2026-10-19 at 2.06.40 AM.jpeg"
  },
  {
    id: "so-006",
    categoria: "Lentes de Sol",
    nombre: "Sol Redondos Steampunk",
    descripcion: "Protecciones laterales y puente metálico.",
    precio: 53000,
    img: "images/WhatsApp Image 2026-10-19 at 2.06.41 AM.jpeg"
  },
  {
    id: "so-007",
    categoria: "Lentes de Sol",
    nombre: "Sol Oversize Glamour",
    descripcion: "Marco grande estilizado con cristales marrones.",
    precio: 51000,
    img: "images/WhatsApp Image 2026-10-19 at 2.07.50 AM (1).jpeg"
  },
  {
    id: "so-008",
    categoria: "Lentes de Sol",
    nombre: "Sol Cuadrados Hex",
    descripcion: "Marco fino en tono cobrizo y lentes polarizadas.",
    precio: 49000,
    img: "images/WhatsApp Image 2026-10-19 at 2.07.50 AM.jpeg"
  },
  {
    id: "so-009",
    categoria: "Lentes de Sol",
    nombre: "Sol Ciclistas Wrapping",
    descripcion: "Diseño envolvente con alta protección periférica.",
    precio: 43000,
    img: "images/WhatsApp Image 2026-10-19 at 2.07.51 AM (1).jpeg"
  },
  {
    id: "so-010",
    categoria: "Lentes de Sol",
    nombre: "Sol Flat-Top Minimal",
    descripcion: "Línea superior recta con cristales continuos.",
    precio: 54000,
    img: "images/WhatsApp Image 2026-10-19 at 2.07.51 AM.jpeg"
  },

  // Infantil (Categoría: "Infantil")
  {
    id: "inf-001",
    categoria: "Infantil",
    nombre: "CLARA",
    descripcion: "Diseño infantil cómodo y flexible.",
    precio: 28000,
    img: "images/WhatsApp Image 2026-10-19 at 2.18.18 AM.jpeg"
  },
  {
    id: "inf-002",
    categoria: "Infantil",
    nombre: "OPHELIA",
    descripcion: "Marco suave y resistente para niños.",
    precio: 34000,
    img: "images/WhatsApp Image 2026-10-19 at 2.18.19 AM.jpeg"
  },
  {
    id: "inf-003",
    categoria: "Infantil",
    nombre: "ALMENDRA RX",
    descripcion: "Modelo adaptado para corrección visual temprana.",
    precio: 32000,
    img: "images/WhatsApp Image 2026-10-19 at 2.18.19 AM (1).jpeg"
  },
  {
    id: "inf-004",
    categoria: "Infantil",
    nombre: "OLIVIA",
    descripcion: "Visión cómoda para uso escolar.",
    precio: 38000,
    img: "images/WhatsApp Image 2026-10-19 at 2.23.42 AM.jpeg"
  },
  {
    id: "inf-005",
    categoria: "Infantil",
    nombre: "JADE",
    descripcion: "Estilo colorido y divertido para chicos.",
    precio: 26000,
    img: "images/WhatsApp Image 2026-10-19 at 2.18.19 AM (2).jpeg"
  },

  // Accesorios (Categoría: "Accesorios")
  {
    id: "ac-001",
    categoria: "Accesorios",
    nombre: "Estuche Rígido",
    descripcion: "Protección para anteojos, varios colores.",
    precio: 9000,
    img: "https://picsum.photos/seed/ac1/500/500"
  },
  {
    id: "ac-002",
    categoria: "Accesorios",
    nombre: "Líquido Limpiador + Paño",
    descripcion: "Kit de limpieza para cristales.",
    precio: 6500,
    img: "https://picsum.photos/seed/ac2/500/500"
  },
  {
    id: "ac-003",
    categoria: "Accesorios",
    nombre: "Cordón para Anteojos",
    descripcion: "Sujetador ajustable, varios diseños.",
    precio: 4500,
    img: "https://picsum.photos/seed/ac3/500/500"
  },
  {
    id: "ac-004",
    categoria: "Accesorios",
    nombre: "Solución Multiuso Lentes (360ml)",
    descripcion: "Limpieza y desinfección para lentes suaves.",
    precio: 12000,
    img: "https://picsum.photos/seed/ac4/500/500"
  },
  {
    id: "ac-005",
    categoria: "Accesorios",
    nombre: "Mini Destornillador de Precisión",
    descripcion: "Herramienta portallaves para ajustar patillas.",
    precio: 3500,
    img: "https://picsum.photos/seed/ac5/500/500"
  },

  // Lentes de contacto (Categoría: "Lentes de contacto")
  {
    id: "lc-101",
    categoria: "Lentes de contacto",
    nombre: "Lentes de Contacto Blandos Descartables",
    descripcion: "Caja de 6 unidades, alta hidratación.",
    precio: 31000,
    img: "https://picsum.photos/seed/lc1/500/500"
  },

  // Líquido de lentes de contacto (Categoría: "Liquido para Lentes de contacto")
  {
    id: "liq-101",
    categoria: "Liquido para Lentes de contacto",
    nombre: "Líquido Único de Mantenimiento",
    descripcion: "Frasco de 350ml con estuche incluido.",
    precio: 14500,
    img: "https://picsum.photos/seed/liq1/500/500"
  },

  // Marcas (Categoría: "Marca 1", "Marca 2", etc.)
  {
    id: "m1-001",
    categoria: "Marca 1",
    nombre: "Modelo Exclusivo Marca 1",
    descripcion: "Diseño premium de alta gama.",
    precio: 65000,
    img: "https://picsum.photos/seed/m1/500/500"
  },
  {
    id: "m2-001",
    categoria: "Marca 2",
    nombre: "Modelo Clásico Marca 2",
    descripcion: "Estilo sofisticado y duradero.",
    precio: 62000,
    img: "https://picsum.photos/seed/m2/500/500"
  }
];

// Permite reutilizar el catálogo en Node.js si hace falta
if (typeof module !== "undefined" && module.exports) module.exports = PRODUCTS;