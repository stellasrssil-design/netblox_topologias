// Engine 3D Estilo Roblox com Three.js
let scene, camera, renderer;
let avatar, leftLeg, rightLeg, leftArm, rightArm;
let currentTopoIndex = 0;
let score = 0;
let networkGroup = new THREE.Group();
let packets = [];
let linkMeshes = [];
let nodeMap = {};

// Controles do Avatar
const keys = {};
let velocityY = 0;
let isGrounded = true;
let camYaw = 0;
let camPitch = 0.45;
let isDragging = false;
let prevMouse = { x: 0, y: 0 };

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function init() {
  const container = document.getElementById("game-container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e293b);
  scene.fog = new THREE.Fog(0x1e293b, 35, 95);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Iluminação estilo Roblox Obby / Studio
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.85);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(18, 30, 15);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  createBaseplate();
  createRobloxAvatar();
  scene.add(networkGroup);

  loadTopology(0);
  setupEvents();
  animate();
}

function createBaseplate() {
  // Baseplate clássica com textura quadriculada de studs
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 128, 128);
  ctx.fillStyle = "#3e4e63";
  ctx.beginPath();
  ctx.arc(32, 32, 10, 0, Math.PI * 2);
  ctx.arc(96, 32, 10, 0, Math.PI * 2);
  ctx.arc(32, 96, 10, 0, Math.PI * 2);
  ctx.arc(96, 96, 10, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 22);

  const floorGeo = new THREE.BoxGeometry(44, 1, 44);
  const floorMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.5;
  floor.receiveShadow = true;
  scene.add(floor);
}

function createRobloxAvatar() {
  avatar = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // Cabeça clássica amarela
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 }); // Camisa Engenheiro de Redes
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

  // Tronco
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 0.6), torsoMat);
  torso.position.y = 1.65;
  torso.castShadow = true;
  avatar.add(torso);

  // Cabeça
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), skinMat);
  head.position.y = 2.75;
  head.castShadow = true;
  avatar.add(head);

  // Capacete Técnico
  const hat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.6, 0.35, 16),
    new THREE.MeshStandardMaterial({ color: 0xef4444 })
  );
  hat.position.y = 3.25;
  avatar.add(hat);

  // Braços
  leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.2, 0.45), skinMat);
  leftArm.position.set(-0.88, 1.65, 0);
  avatar.add(leftArm);

  rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.2, 0.45), skinMat);
  rightArm.position.set(0.88, 1.65, 0);
  avatar.add(rightArm);

  // Pernas
  leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 0.5), legMat);
  leftLeg.position.set(-0.32, 0.5, 0);
  avatar.add(leftLeg);

  rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 0.5), legMat);
  rightLeg.position.set(0.32, 0.5, 0);
  avatar.add(rightLeg);

  avatar.position.set(0, 0, 12);
  scene.add(avatar);
}

function makeTextSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fillRect(20, 20, 472, 88);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, 472, 88);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.5, 1.15, 1);
  return sprite;
}

function createDeviceMesh(node) {
  const group = new THREE.Group();
  let mainMesh;

  const colors = {
    pc: 0x38bdf8,
    laptop: 0x60a5fa,
    printer: 0x94a3b8,
    router: 0x0ea5e9,
    switch: 0x10b981,
    hub: 0xd946ef,
    server: 0x6366f1,
    phone: 0x22d3ee,
    tablet: 0x818cf8,
    appliance: 0xf59e0b
  };

  const mat = new THREE.MeshStandardMaterial({
    color: colors[node.type] || 0x38bdf8,
    roughness: 0.35
  });

  if (node.type === "router") {
    mainMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.5, 20), mat);
    mainMesh.position.y = 0.45;
    const ant1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1), mat);
    ant1.position.set(-0.5, 1.0, -0.3);
    const ant2 = ant1.clone();
    ant2.position.set(0.5, 1.0, -0.3);
    group.add(ant1, ant2);
  } else if (node.type === "server") {
    mainMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 1.2), mat);
    mainMesh.position.y = 1.2;
  } else if (node.type === "switch" || node.type === "hub") {
    mainMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 1.2), mat);
    mainMesh.position.y = 0.35;
  } else {
    mainMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.1), mat);
    mainMesh.position.y = 0.65;
  }

  mainMesh.castShadow = true;
  group.add(mainMesh);

  // Pedestal estilo Roblox
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.5, 0.15, 20),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  );
  pad.position.y = 0.075;
  group.add(pad);

  const label = makeTextSprite(node.label);
  label.position.set(0, 2.7, 0);
  group.add(label);

  group.position.set(node.x, 0, node.z);
  return group;
}

function loadTopology(index) {
  currentTopoIndex = index;
  const topo = TOPOLOGIES[index];

  // Limpar cena anterior
  while (networkGroup.children.length > 0) {
    networkGroup.remove(networkGroup.children[0]);
  }
  packets = [];
  linkMeshes = [];
  nodeMap = {};

  // Atualizar UI
  document.querySelectorAll(".topo-btn").forEach((b, idx) => {
    b.classList.toggle("active", idx === index);
  });
  document.getElementById("topology-subtitle").textContent = topo.title;
  document.getElementById("stage-counter").textContent = `${index + 1} / ${TOPOLOGIES.length}`;
  document.getElementById("info-title").textContent = topo.title;
  document.getElementById("info-desc").innerHTML = topo.description;

  const devContainer = document.getElementById("devices-list");
  devContainer.innerHTML = "";
  topo.nodes.forEach(n => {
    const tag = document.createElement("span");
    tag.className = "device-tag";
    tag.textContent = n.label;
    devContainer.appendChild(tag);

    const mesh = createDeviceMesh(n);
    networkGroup.add(mesh);
    nodeMap[n.id] = { ...n, mesh };
  });

  // Criar enlaces (cabos ou ondas wireless)
  topo.links.forEach((lnk, idx) => {
    const a = nodeMap[lnk.from];
    const b = nodeMap[lnk.to];
    const p1 = new THREE.Vector3(a.x, 0.45, a.z);
    const p2 = new THREE.Vector3(b.x, 0.45, b.z);
    const dist = p1.distanceTo(p2);

    const geo = new THREE.CylinderGeometry(
      lnk.kind === "wireless" ? 0.08 : 0.12,
      lnk.kind === "wireless" ? 0.08 : 0.12,
      dist,
      10
    );
    const mat = new THREE.MeshStandardMaterial({
      color: lnk.stp ? 0xf97316 : (lnk.kind === "wireless" ? 0x22c55e : 0x38bdf8),
      emissive: lnk.kind === "wireless" ? 0x15803d : 0x0369a1,
      emissiveIntensity: 0.4
    });

    const tube = new THREE.Mesh(geo, mat);
    tube.position.copy(p1).add(p2).multiplyScalar(0.5);
    tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
    tube.userData = { linkIndex: idx };

    networkGroup.add(tube);
    linkMeshes.push({
      mesh: tube,
      data: lnk,
      p1,
      p2,
      broken: false
    });
  });

  updateNetworkStatus();
  addLog(`Topologia carregada: ${topo.title}`, "info");
}

function toggleLinkFault(linkObj) {
  linkObj.broken = !linkObj.broken;
  if (linkObj.broken) {
    linkObj.mesh.material.color.setHex(0xef4444);
    linkObj.mesh.material.emissive.setHex(0x7f1d1d);
    linkObj.mesh.scale.set(0.6, 0.85, 0.6);
    addLog(`ALERTA: Falha no enlace ${linkObj.data.from.toUpperCase()} ↔ ${linkObj.data.to.toUpperCase()}!`, "err");
  } else {
    linkObj.mesh.material.color.setHex(linkObj.data.stp ? 0xf97316 : 0x38bdf8);
    linkObj.mesh.material.emissive.setHex(0x0369a1);
    linkObj.mesh.scale.set(1, 1, 1);
    addLog(`Enlace ${linkObj.data.from.toUpperCase()} ↔ ${linkObj.data.to.toUpperCase()} restaurado.`, "ok");
  }
  updateNetworkStatus();
}

function updateNetworkStatus() {
  const brokenCount = linkMeshes.filter(l => l.broken).length;
  const topo = TOPOLOGIES[currentTopoIndex];
  const statusEl = document.getElementById("net-status");

  if (brokenCount === 0) {
    statusEl.textContent = "ONLINE";
    statusEl.className = "val ok";
  } else if ((topo.resilience === "ring" || topo.resilience === "mesh") && brokenCount <= 2) {
    statusEl.textContent = "ROTA ALT. ATIVA";
    statusEl.className = "val warn";
    addLog("STP/Malha: Tráfego redirecionado por caminho redundante!", "warn");
  } else {
    statusEl.textContent = "FALHA CRÍTICA";
    statusEl.className = "val err";
  }
}

function sendPingPackets() {
  const activeLinks = linkMeshes.filter(l => !l.broken);
  if (activeLinks.length === 0) {
    addLog("Ping falhou: Todos os enlaces estão rompidos!", "err");
    return;
  }

  activeLinks.forEach(l => {
    const pkt = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x4ade80 })
    );
    pkt.position.copy(l.p1);
    networkGroup.add(pkt);
    packets.push({ mesh: pkt, start: l.p1.clone(), end: l.p2.clone(), t: 0, dir: 1 });
  });

  score += 25;
  document.getElementById("score-val").textContent = score;
  addLog(`Ping ICMP enviado com sucesso em ${activeLinks.length} enlaces! (+25 pts)`, "ok");
}

function addLog(msg, type = "info") {
  const box = document.getElementById("log-box");
  const div = document.createElement("div");
  div.className = `log-entry ${type}`;
  div.textContent = `[${new Date().toLocaleTimeString().slice(0,5)}] ${msg}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function setupEvents() {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("keydown", e => {
    keys[e.code] = true;
    if (e.code === "Space" && isGrounded) {
      velocityY = 0.28;
      isGrounded = false;
    }
  });

  window.addEventListener("keyup", e => {
    keys[e.code] = false;
  });

  // Botões D-Pad Mobile
  document.querySelectorAll("#mobile-dpad button").forEach(btn => {
    const k = btn.dataset.key;
    btn.addEventListener("touchstart", e => {
      e.preventDefault();
      keys[k] = true;
      if (k === "Space" && isGrounded) {
        velocityY = 0.28;
        isGrounded = false;
      }
    });
    btn.addEventListener("touchend", e => {
      e.preventDefault();
      keys[k] = false;
    });
  });

  // Câmera Orbital & Clique em Cabos
  renderer.domElement.addEventListener("pointerdown", e => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(linkMeshes.map(l => l.mesh));
    if (hits.length > 0) {
      const idx = hits[0].object.userData.linkIndex;
      toggleLinkFault(linkMeshes[idx]);
    }
  });

  window.addEventListener("pointermove", e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    camYaw -= dx * 0.006;
    camPitch = Math.max(0.15, Math.min(1.25, camPitch + dy * 0.006));
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("pointerup", () => {
    isDragging = false;
  });

  // Menu Topologias
  document.querySelectorAll(".topo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      loadTopology(parseInt(btn.dataset.topo, 10));
    });
  });

  document.getElementById("btn-ping").addEventListener("click", sendPingPackets);

  document.getElementById("btn-fault").addEventListener("click", () => {
    const intact = linkMeshes.filter(l => !l.broken);
    if (intact.length > 0) {
      const randomLink = intact[Math.floor(Math.random() * intact.length)];
      toggleLinkFault(randomLink);
    }
  });

  document.getElementById("btn-repair").addEventListener("click", () => {
    linkMeshes.forEach(l => {
      if (l.broken) toggleLinkFault(l);
    });
  });
}

function updateAvatar(time) {
  const speed = 0.16;
  let moveX = 0;
  let moveZ = 0;

  if (keys["KeyW"] || keys["ArrowUp"]) moveZ -= 1;
  if (keys["KeyS"] || keys["ArrowDown"]) moveZ += 1;
  if (keys["KeyA"] || keys["ArrowLeft"]) moveX -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) moveX += 1;

  if (moveX !== 0 || moveZ !== 0) {
    const angle = Math.atan2(moveX, moveZ) + camYaw;
    avatar.position.x += Math.sin(angle) * speed;
    avatar.position.z += Math.cos(angle) * speed;
    avatar.rotation.y = angle;

    // Limites da Baseplate
    avatar.position.x = Math.max(-20, Math.min(20, avatar.position.x));
    avatar.position.z = Math.max(-20, Math.min(20, avatar.position.z));

    // Animação clássica de caminhada Roblox
    const swing = Math.sin(time * 0.014) * 0.6;
    leftLeg.rotation.x = swing;
    rightLeg.rotation.x = -swing;
    leftArm.rotation.x = -swing;
    rightArm.rotation.x = swing;
  } else {
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
    leftArm.rotation.x = 0;
    rightArm.rotation.x = 0;
  }

  // Gravidade e Pulo
  avatar.position.y += velocityY;
  if (avatar.position.y > 0) {
    velocityY -= 0.015;
  } else {
    avatar.position.y = 0;
    velocityY = 0;
    isGrounded = true;
  }

  // Câmera em 3ª Pessoa seguindo o Avatar
  const camDist = 15;
  camera.position.x = avatar.position.x + Math.sin(camYaw) * camDist * Math.cos(camPitch);
  camera.position.z = avatar.position.z + Math.cos(camYaw) * camDist * Math.cos(camPitch);
  camera.position.y = avatar.position.y + 2 + Math.sin(camPitch) * camDist;
  camera.lookAt(avatar.position.x, avatar.position.y + 1.8, avatar.position.z);
}

function updatePackets() {
  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i];
    p.t += 0.025 * p.dir;
    if (p.t >= 1) {
      p.t = 1;
      p.dir = -1;
      p.mesh.material.color.setHex(0x38bdf8); // Resposta ICMP (Pong)
    } else if (p.t <= 0 && p.dir === -1) {
      networkGroup.remove(p.mesh);
      packets.splice(i, 1);
      continue;
    }
    p.mesh.position.lerpVectors(p.start, p.end, p.t);
  }
}

function animate(time = 0) {
  requestAnimationFrame(animate);
  updateAvatar(time);
  updatePackets();
  renderer.render(scene, camera);
}

init();
