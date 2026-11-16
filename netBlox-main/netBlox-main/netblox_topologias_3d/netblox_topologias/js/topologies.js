// Definição exata das 7 topologias dos diagramas do Cisco Packet Tracer
const TOPOLOGIES = [
  {
    id: 0,
    title: "1. Ponto a Ponto (Cabeado)",
    description: "Ligação física dedicada entre dois nós finais: <b>PC-PT Computer1</b> e <b>Printer-PT Impressora1</b>. Se o cabo romper, a comunicação cessa totalmente.",
    resilience: "none",
    nodes: [
      { id: "pc1", label: "PC-PT Computer1", type: "pc", x: -7, z: 0 },
      { id: "pr1", label: "Printer-PT Impressora1", type: "printer", x: 7, z: 0 }
    ],
    links: [
      { from: "pc1", to: "pr1", kind: "wired" }
    ]
  },
  {
    id: 1,
    title: "2. Ponto a Ponto (Bluetooth)",
    description: "Comunicação sem fio de curto alcance (WPAN) conectando <b>SMARTPHONE-PT IPHONE18PROMAX</b> diretamente à <b>Appliance CAFETEIRA</b>.",
    resilience: "none",
    nodes: [
      { id: "phone", label: "IPHONE18PROMAX", type: "phone", x: -6, z: 3 },
      { id: "coffee", label: "Appliance CAFETEIRA", type: "appliance", x: 6, z: -3 }
    ],
    links: [
      { from: "phone", to: "coffee", kind: "wireless" }
    ]
  },
  {
    id: 2,
    title: "3. Estrela (Com Roteador)",
    description: "Todos os dispositivos convergem para o nó central <b>HomeRouter-PT-AC Wireless Router0</b> via cabo (PC1, Laptop0, Printer1) e Wi-Fi (Smartphone1, Tablet PC0).",
    resilience: "central",
    nodes: [
      { id: "router0", label: "Wireless Router0", type: "router", x: 0, z: 0 },
      { id: "phone1", label: "Smartphone1", type: "phone", x: -8, z: -5 },
      { id: "tablet0", label: "Tablet PC0", type: "tablet", x: 8, z: -5 },
      { id: "pc1", label: "PC-PT PC1", type: "pc", x: -7, z: 6 },
      { id: "lap0", label: "Laptop-PT Laptop0", type: "laptop", x: 0, z: 7 },
      { id: "pr1", label: "Printer-PT Printer1", type: "printer", x: 7, z: 6 }
    ],
    links: [
      { from: "phone1", to: "router0", kind: "wireless" },
      { from: "tablet0", to: "router0", kind: "wireless" },
      { from: "pc1", to: "router0", kind: "wired" },
      { from: "lap0", to: "router0", kind: "wired" },
      { from: "pr1", to: "router0", kind: "wired" }
    ]
  },
  {
    id: 3,
    title: "4. Barramento (Com Hubs)",
    description: "Backbone linear interligando <b>Hub1</b> a <b>Hub5</b> (domínio de colisão único). Cada hub conecta uma estação final (Laptop2, PC1, Printer1, PC2, Laptop1).",
    resilience: "bus",
    nodes: [
      { id: "hub1", label: "Hub-PT Hub1", type: "hub", x: -10, z: -2 },
      { id: "hub2", label: "Hub-PT Hub2", type: "hub", x: -5, z: -2 },
      { id: "hub3", label: "Hub-PT Hub3", type: "hub", x: 0, z: -2 },
      { id: "hub4", label: "Hub-PT Hub4", type: "hub", x: 5, z: -2 },
      { id: "hub5", label: "Hub-PT Hub5", type: "hub", x: 10, z: -2 },
      { id: "lap2", label: "Laptop2", type: "laptop", x: -11, z: 5 },
      { id: "pc1", label: "PC1", type: "pc", x: -5, z: 5 },
      { id: "pr1", label: "Printer1", type: "printer", x: 0, z: 5 },
      { id: "pc2", label: "PC2", type: "pc", x: 5, z: 5 },
      { id: "lap1", label: "Laptop1", type: "laptop", x: 11, z: 5 }
    ],
    links: [
      { from: "hub1", to: "hub2", kind: "wired" },
      { from: "hub2", to: "hub3", kind: "wired" },
      { from: "hub3", to: "hub4", kind: "wired" },
      { from: "hub4", to: "hub5", kind: "wired" },
      { from: "lap2", to: "hub1", kind: "wired" },
      { from: "pc1", to: "hub2", kind: "wired" },
      { from: "pr1", to: "hub3", kind: "wired" },
      { from: "pc2", to: "hub4", kind: "wired" },
      { from: "lap1", to: "hub5", kind: "wired" }
    ]
  },
  {
    id: 4,
    title: "5. Anel (Com Switches)",
    description: "Circuito fechado entre <b>Switch0 a Switch4</b> com protocolo STP (porta laranja em espera). Se um enlace do anel cair, o STP ativa a rota redundante!",
    resilience: "ring",
    nodes: [
      { id: "sw2", label: "Switch2", type: "switch", x: -4.5, z: -4 },
      { id: "sw3", label: "Switch3", type: "switch", x: 4.5, z: -4 },
      { id: "sw4", label: "Switch4", type: "switch", x: 6.5, z: 2 },
      { id: "sw0", label: "Switch0", type: "switch", x: 0, z: 6.5 },
      { id: "sw1", label: "Switch1", type: "switch", x: -6.5, z: 2 },
      { id: "pc1", label: "COMPUTADOR1", type: "pc", x: -9, z: -8 },
      { id: "pr1", label: "IMPRESSORA1", type: "printer", x: 9, z: -8 },
      { id: "srv1", label: "SERVIDOR1", type: "server", x: 12, z: 2 },
      { id: "nb1", label: "NOTEBOOK1", type: "laptop", x: 0, z: 11 },
      { id: "pc2", label: "COMPUTADOR2", type: "pc", x: -12, z: 2 }
    ],
    links: [
      { from: "sw2", to: "sw3", kind: "wired", stp: true },
      { from: "sw3", to: "sw4", kind: "wired" },
      { from: "sw4", to: "sw0", kind: "wired" },
      { from: "sw0", to: "sw1", kind: "wired" },
      { from: "sw1", to: "sw2", kind: "wired" },
      { from: "pc1", to: "sw2", kind: "wired" },
      { from: "pr1", to: "sw3", kind: "wired" },
      { from: "srv1", to: "sw4", kind: "wired" },
      { from: "nb1", to: "sw0", kind: "wired" },
      { from: "pc2", to: "sw1", kind: "wired" }
    ]
  },
  {
    id: 5,
    title: "6. Malha (Com Switches)",
    description: "Topologia Mesh completa onde <b>Switch0 a Switch4</b> possuem múltiplas conexões cruzadas entre si. Máxima tolerância a falhas e alta disponibilidade.",
    resilience: "mesh",
    nodes: [
      { id: "sw2", label: "Switch2", type: "switch", x: -4.5, z: -4 },
      { id: "sw3", label: "Switch3", type: "switch", x: 4.5, z: -4 },
      { id: "sw4", label: "Switch4", type: "switch", x: 6.5, z: 2 },
      { id: "sw0", label: "Switch0", type: "switch", x: 0, z: 6.5 },
      { id: "sw1", label: "Switch1", type: "switch", x: -6.5, z: 2 },
      { id: "pc1", label: "COMPUTADOR1", type: "pc", x: -9, z: -8 },
      { id: "pr1", label: "IMPRESSORA1", type: "printer", x: 9, z: -8 },
      { id: "srv1", label: "SERVIDOR1", type: "server", x: 12, z: 2 },
      { id: "nb1", label: "NOTEBOOK1", type: "laptop", x: 0, z: 11 },
      { id: "pc2", label: "COMPUTADOR2", type: "pc", x: -12, z: 2 }
    ],
    links: [
      { from: "sw2", to: "sw3", kind: "wired", stp: true },
      { from: "sw3", to: "sw4", kind: "wired" },
      { from: "sw4", to: "sw0", kind: "wired" },
      { from: "sw0", to: "sw1", kind: "wired" },
      { from: "sw1", to: "sw2", kind: "wired" },
      { from: "sw2", to: "sw4", kind: "wired", stp: true },
      { from: "sw2", to: "sw0", kind: "wired", stp: true },
      { from: "sw3", to: "sw1", kind: "wired", stp: true },
      { from: "sw3", to: "sw0", kind: "wired" },
      { from: "sw1", to: "sw4", kind: "wired", stp: true },
      { from: "pc1", to: "sw2", kind: "wired" },
      { from: "pr1", to: "sw3", kind: "wired" },
      { from: "srv1", to: "sw4", kind: "wired" },
      { from: "nb1", to: "sw0", kind: "wired" },
      { from: "pc2", to: "sw1", kind: "wired" }
    ]
  },
  {
    id: 6,
    title: "7. Rede Tipo Árvore (Híbrida)",
    description: "Arquitetura hierárquica unindo um <b>Barramento</b> (Hub1-Hub4) às sub-redes <b>Ponto a Ponto</b> (Server1), <b>Estrela</b> (Router1), <b>Anel</b> e <b>Malha</b>.",
    resilience: "tree",
    nodes: [
      { id: "hub1", label: "Hub1 (Barramento)", type: "hub", x: -11, z: -9 },
      { id: "hub2", label: "Hub2 (Barramento)", type: "hub", x: -5, z: -9 },
      { id: "hub3", label: "Hub3 (Barramento)", type: "hub", x: 1, z: -9 },
      { id: "hub4", label: "Hub4 (Barramento)", type: "hub", x: 7, z: -9 },
      { id: "srv_p2p", label: "Server1 (P2P)", type: "server", x: -12, z: -3 },
      { id: "r1", label: "Router1 (Estrela)", type: "router", x: -5, z: -3 },
      { id: "pc0", label: "PC0", type: "pc", x: -8, z: 1 },
      { id: "lap0", label: "Laptop0", type: "laptop", x: -5, z: 2 },
      { id: "pr0", label: "Printer0", type: "printer", x: -2, z: 1 },
      { id: "r2", label: "Router2 (Anel)", type: "router", x: 1, z: -3 },
      { id: "sw_a1", label: "Switch Anel A", type: "switch", x: -1, z: 3 },
      { id: "sw_a2", label: "Switch Anel B", type: "switch", x: 3, z: 3 },
      { id: "sw_a3", label: "Switch Anel C", type: "switch", x: 1, z: 7 },
      { id: "r3", label: "Router3 (Malha)", type: "router", x: 7, z: -3 },
      { id: "sw_m1", label: "Switch Malha 1", type: "switch", x: 7, z: 3 },
      { id: "sw_m2", label: "Switch Malha 2", type: "switch", x: 12, z: 3 },
      { id: "sw_m3", label: "Switch Malha 3", type: "switch", x: 9.5, z: 7 }
    ],
    links: [
      { from: "hub1", to: "hub2", kind: "wired" },
      { from: "hub2", to: "hub3", kind: "wired" },
      { from: "hub3", to: "hub4", kind: "wired" },
      { from: "hub1", to: "srv_p2p", kind: "wired" },
      { from: "hub2", to: "r1", kind: "wired" },
      { from: "r1", to: "pc0", kind: "wired" },
      { from: "r1", to: "lap0", kind: "wired" },
      { from: "r1", to: "pr0", kind: "wired" },
      { from: "hub3", to: "r2", kind: "wired" },
      { from: "r2", to: "sw_a1", kind: "wired" },
      { from: "sw_a1", to: "sw_a2", kind: "wired" },
      { from: "sw_a2", to: "sw_a3", kind: "wired" },
      { from: "sw_a3", to: "sw_a1", kind: "wired" },
      { from: "hub4", to: "r3", kind: "wired" },
      { from: "r3", to: "sw_m1", kind: "wired" },
      { from: "sw_m1", to: "sw_m2", kind: "wired" },
      { from: "sw_m2", to: "sw_m3", kind: "wired" },
      { from: "sw_m3", to: "sw_m1", kind: "wired" }
    ]
  }
];
