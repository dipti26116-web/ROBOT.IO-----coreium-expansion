const STORAGE_KEY = "robotio-save";

const defaultState = {
  credits: 120,
  ore: 0,
  steel: 0,
  battery: 0,
  crystal: 0,
  coreium: 0,
  quantumCore: 0,
  power: 110,
  miners: 1,
  carriers: 0,
  builders: 0,
  defenders: 0,
  aiBots: 0,
  buildings: {
    mineFactory: 1,
    powerPlant: 1,
    warehouse: 1,
    researchLab: 1,
    launchPad: 1,
    robotGarage: 1,
  },
  research: {
    speed: 0,
    laser: 0,
    flying: 0,
    ai: 0,
    quantum: 0,
  },
  currentPlanet: "Earth",
  unlockedPlanets: ["Earth"],
  automation: true,
  mission: "Mine the first ore and build your first factory.",
  rebirths: 0,
};

const state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultState };
    const parsed = JSON.parse(saved);
    return {
      ...defaultState,
      ...parsed,
      buildings: { ...defaultState.buildings, ...(parsed.buildings || {}) },
      research: { ...defaultState.research, ...(parsed.research || {}) },
    };
  } catch (error) {
    console.warn("Save data could not be loaded.", error);
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const planets = {
  Earth: { name: "Earth", resource: "Ore", color: "#4ade80", yield: 1.2, cost: 0 },
  Moon: { name: "Moon", resource: "Crystal", color: "#7dd3fc", yield: 1.5, cost: 300 },
  Mars: { name: "Mars", resource: "Battery", color: "#fb923c", yield: 1.8, cost: 800 },
  Alien: { name: "Alien Planet", resource: "Coreium", color: "#a78bfa", yield: 2.3, cost: 1800 },
  Space: { name: "Space Station", resource: "Quantum Core", color: "#fef08a", yield: 2.8, cost: 4000 },
};

const robots = {
  miner: { name: "Miner Bot", desc: "Finds ore for the factory.", baseCost: 60 },
  carrier: { name: "Carrier Bot", desc: "Moves resources across the base.", baseCost: 90 },
  builder: { name: "Builder Bot", desc: "Constructs buildings faster.", baseCost: 140 },
  defender: { name: "Defender Bot", desc: "Protects your colony from threats.", baseCost: 170 },
  ai: { name: "AI Bot", desc: "Automates production and profit.", baseCost: 220 },
};

const buildings = {
  mineFactory: { name: "MineFactory", desc: "Adds mining capacity and smelting power.", baseCost: 80 },
  powerPlant: { name: "Power Plant", desc: "Raises the energy ceiling.", baseCost: 110 },
  warehouse: { name: "Warehouse", desc: "Stores more cargo for better sales.", baseCost: 140 },
  researchLab: { name: "Research Lab", desc: "Unlocks better upgrades.", baseCost: 170 },
  launchPad: { name: "Launch Pad", desc: "Opens access to distant planets.", baseCost: 220 },
  robotGarage: { name: "Robot Garage", desc: "Cuts robot costs and improves output.", baseCost: 200 },
};

const research = {
  speed: { name: "Speed II", desc: "Boosts mining efficiency.", cost: 180 },
  laser: { name: "Laser Miner", desc: "Improves ore-to-steel conversion.", cost: 260 },
  flying: { name: "Flying Robot", desc: "Makes carriers and builders faster.", cost: 340 },
  ai: { name: "AI Network", desc: "Increases automation and profits.", cost: 420 },
  quantum: { name: "Quantum Robot", desc: "Unlocks the future of robotics.", cost: 800 },
};

function getPlanet() {
  return planets[state.currentPlanet];
}

function getResourceKey() {
  const mapping = {
    Earth: "ore",
    Moon: "crystal",
    Mars: "battery",
    Alien: "coreium",
    Space: "quantumCore",
  };
  return mapping[state.currentPlanet] || "ore";
}

function getMultiplier() {
  return Math.pow(1.5, state.rebirths);
}

function getPowerCapacity() {
  return 110 + state.buildings.powerPlant * 35;
}

function getPowerUsage() {
  return state.miners * 0.24 + state.carriers * 0.12 + state.builders * 0.16 + state.defenders * 0.14 + state.aiBots * 0.18 + 2;
}

function getMiningYield() {
  const planetBonus = getPlanet().yield;
  const speedBonus = 1 + state.research.speed * 0.35;
  const laserBonus = 1 + state.research.laser * 0.2;
  const aiBonus = 1 + state.aiBots * 0.05;
  return (state.miners * 1.2 + state.builders * 0.2) * planetBonus * speedBonus * laserBonus * aiBonus * getMultiplier();
}

function getSmeltYield() {
  return (1 + state.buildings.mineFactory * 0.2 + state.research.laser * 0.25) * getMultiplier();
}

function getRobotCost(type) {
  let cost = robots[type].baseCost;
  if (state.buildings.robotGarage > 1) cost -= state.buildings.robotGarage * 8;
  if (state.research.flying) cost -= 15;
  return Math.max(35, cost);
}

function getBuildingCost(type) {
  let cost = buildings[type].baseCost + state.buildings[type] * 35;
  if (type === "powerPlant") cost += 20;
  if (type === "researchLab") cost += 15;
  return cost;
}

function getResearchCost(type) {
  return research[type].cost + state.research[type] * 55;
}

function spawnFloatingText(text, targetId, extraClass = "") {
  const layer = document.getElementById("floatingLayer");
  const target = document.getElementById(targetId);
  if (!layer || !target) return;
  const rect = target.getBoundingClientRect();
  const node = document.createElement("div");
  node.className = `floating-text ${extraClass}`.trim();
  node.textContent = text;
  node.style.left = `${rect.left + rect.width / 2 - 20}px`;
  node.style.top = `${rect.top + 12}px`;
  layer.appendChild(node);
  setTimeout(() => node.remove(), 900);
}

function showInsufficientModal(message) {
  const overlay = document.getElementById("modalOverlay");
  const text = document.getElementById("modalMessage");
  if (!overlay || !text) return;
  text.textContent = message;
  overlay.classList.remove("hidden");
}

function hideInsufficientModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function showMiningPulse() {
  const btn = document.getElementById("mineBtn");
  const status = document.getElementById("miningStatus");
  const resourceName = getPlanet().resource;
  const gain = Math.max(1, Math.round(getMiningYield()));
  btn.innerHTML = `⛏ Mining...<span class="mining-progress"><span><i></i></span></span>`;
  status.textContent = `⛏ Mining ${resourceName.toLowerCase()}... ${resourceName} +${gain}`;
  setTimeout(() => {
    btn.innerHTML = `⛏ Mine ${resourceName}`;
    status.textContent = "⛏ Ready to mine.";
  }, 700);
}

function mineOre() {
  const resourceKey = getResourceKey();
  const resourceName = getPlanet().resource;
  state[resourceKey] += getMiningYield();
  state.mission = `Mining ${resourceName.toLowerCase()} on ${state.currentPlanet}.`;
  showMiningPulse();
  spawnFloatingText(`${resourceName} +${Math.max(1, Math.round(getMiningYield()))}`, "mineBtn", "");
  saveState();
  render();
}

function resetProgress() {
  state.credits = 120;
  state.ore = 0;
  state.steel = 0;
  state.battery = 0;
  state.crystal = 0;
  state.coreium = 0;
  state.quantumCore = 0;
  state.power = 110;
  state.miners = 1;
  state.carriers = 0;
  state.builders = 0;
  state.defenders = 0;
  state.aiBots = 0;
  state.buildings = {
    mineFactory: 1,
    powerPlant: 1,
    warehouse: 1,
    researchLab: 1,
    launchPad: 1,
    robotGarage: 1,
  };
  state.research = {
    speed: 0,
    laser: 0,
    flying: 0,
    ai: 0,
    quantum: 0,
  };
  state.currentPlanet = "Earth";
  state.unlockedPlanets = ["Earth"];
  state.automation = true;
  state.mission = "A fresh cycle begins.";
}

function rebirth() {
  if (state.credits < 10000) {
    state.mission = "You need 10,000 credits to rebirth.";
    showInsufficientModal("Insufficient funds to rebirth. Need 10,000 credits.");
    render();
    return;
  }

  state.rebirths += 1;
  resetProgress();
  state.mission = `Rebirth complete. Multiplier is x${getMultiplier().toFixed(2)}.`;
  saveState();
  render();
}

function smeltSteel() {
  if (state.ore < 8) {
    state.mission = "Gather more ore before smelting steel.";
    showInsufficientModal("Insufficient ore to smelt steel. Mine more ore first.");
    render();
    return;
  }
  const amount = Math.floor(state.ore / 8);
  state.ore -= amount * 8;
  state.steel += amount * getSmeltYield();
  state.mission = `Smelted ${amount} batch of steel.`;
  spawnFloatingText(`Steel +${Math.round(amount * getSmeltYield())}`, "smeltBtn", "steel");
  saveState();
  render();
}

function sellCargo() {
  const value = (state.ore * 1.4 + state.steel * 3.2 + state.battery * 4.5 + state.crystal * 6.8 + state.coreium * 15 + state.quantumCore * 28) * getMultiplier();
  state.credits += value;
  state.ore = 0;
  state.steel = 0;
  state.battery = 0;
  state.crystal = 0;
  state.coreium = 0;
  state.quantumCore = 0;
  state.mission = "Cargo sold. Your credits are growing.";
  spawnFloatingText(`+${Math.round(value)}`, "creditsCard", "credits");
  saveState();
  render();
}

function buyRobot(type) {
  const cost = getRobotCost(type);
  if (state.credits < cost) {
    state.mission = `Need ${cost} credits for that robot.`;
    showInsufficientModal(`Insufficient funds for ${robots[type].name}. Need ${cost} credits.`);
    render();
    return;
  }
  state.credits -= cost;
  if (type === "miner") state.miners += 1;
  if (type === "carrier") state.carriers += 1;
  if (type === "builder") state.builders += 1;
  if (type === "defender") state.defenders += 1;
  if (type === "ai") state.aiBots += 1;
  state.mission = `${robots[type].name} deployed.`;
  spawnFloatingText(`-${cost}`, "creditsCard", "credits");
  saveState();
  render();
}

function buyBuilding(type) {
  const cost = getBuildingCost(type);
  if (state.credits < cost) {
    state.mission = `Need ${cost} credits for that building.`;
    showInsufficientModal(`Insufficient funds for ${buildings[type].name}. Need ${cost} credits.`);
    render();
    return;
  }
  state.credits -= cost;
  state.buildings[type] += 1;
  state.mission = `${buildings[type].name} completed.`;
  spawnFloatingText(`-${cost}`, "creditsCard", "credits");
  saveState();
  render();
}

function unlockResearch(type) {
  const cost = getResearchCost(type);
  if (state.credits < cost) {
    state.mission = `Need ${cost} credits for that research.`;
    showInsufficientModal(`Insufficient funds for ${research[type].name}. Need ${cost} credits.`);
    render();
    return;
  }
  state.credits -= cost;
  state.research[type] += 1;
  state.mission = `${research[type].name} unlocked.`;
  spawnFloatingText(`-${cost}`, "creditsCard", "credits");
  saveState();
  render();
}

function selectPlanet(name) {
  const planet = planets[name];
  if (!state.unlockedPlanets.includes(name)) {
    if (state.credits < planet.cost) {
      state.mission = `Need ${planet.cost} credits to reach ${planet.name}.`;
      showInsufficientModal(`Insufficient funds to unlock ${planet.name}. Need ${planet.cost} credits.`);
      render();
      return;
    }
    state.credits -= planet.cost;
    state.unlockedPlanets.push(name);
  }
  state.currentPlanet = name;
  state.mission = `Now exploring ${planet.name}.`;
  spawnFloatingText(`${planet.name}`, "robotCard", "");
  saveState();
  render();
}

function toggleAutomation() {
  state.automation = !state.automation;
  document.getElementById("toggleAutoBtn").textContent = state.automation ? "⏸ Pause Automation" : "▶ Resume Automation";
  state.mission = state.automation ? "Automation enabled." : "Automation paused.";
  saveState();
  render();
}

function tick() {
  if (state.automation) {
    state.power = Math.min(getPowerCapacity(), state.power + state.buildings.powerPlant * 0.8);
    const usage = getPowerUsage();
    if (state.power > usage) {
      state.power -= usage * 0.2;
      const resourceKey = getResourceKey();
      state[resourceKey] += getMiningYield() * 0.2;
      if (resourceKey === "ore" && state.ore >= 8) {
        const amount = Math.floor(state.ore / 8);
        state.ore -= amount * 8;
        state.steel += amount * getSmeltYield();
      }
    }
    if (state.aiBots > 0) {
      state.credits += (state.aiBots * 0.16 + state.carriers * 0.04) * getMultiplier();
    }
  }
  saveState();
  render();
}

function renderFleet() {
  const fleet = [
    ["miner", state.miners],
    ["carrier", state.carriers],
    ["builder", state.builders],
    ["defender", state.defenders],
    ["ai", state.aiBots],
  ];

  document.getElementById("fleetList").innerHTML = fleet
    .map(([key, count]) => {
      const robot = robots[key];
      const cost = getRobotCost(key);
      return `
        <div class="card">
          <div>
            <h3>${robot.name}</h3>
            <p>${robot.desc}</p>
          </div>
          <div class="meta">
            <div>Owned: ${count}</div>
            <div>Cost: ${cost} credits</div>
            <button onclick="buyRobot('${key}')">Build</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderBuildings() {
  document.getElementById("buildingList").innerHTML = Object.entries(buildings)
    .map(([key, building]) => {
      const level = state.buildings[key];
      const cost = getBuildingCost(key);
      return `
        <div class="card">
          <div>
            <h3>${building.name}</h3>
            <p>${building.desc}</p>
          </div>
          <div class="meta">
            <div>Level: ${level}</div>
            <div>Cost: ${cost} credits</div>
            <button onclick="buyBuilding('${key}')">Build</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderResearch() {
  document.getElementById("researchList").innerHTML = Object.entries(research)
    .map(([key, item]) => {
      const level = state.research[key];
      const cost = getResearchCost(key);
      return `
        <div class="card">
          <div>
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
          </div>
          <div class="meta">
            <div>Level: ${level}</div>
            <div>Cost: ${cost} credits</div>
            <button onclick="unlockResearch('${key}')">Research</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderPlanets() {
  document.getElementById("planetList").innerHTML = Object.entries(planets)
    .map(([key, planet]) => {
      const unlocked = state.unlockedPlanets.includes(key);
      const active = state.currentPlanet === key;
      return `
        <div class="card">
          <div>
            <h3 style="color:${planet.color}">${planet.name}</h3>
            <p>Resource: ${planet.resource}</p>
          </div>
          <div class="meta">
            <div>${unlocked ? "Unlocked" : `Cost: ${planet.cost} credits`}</div>
            <button onclick="selectPlanet('${key}')" ${active ? "disabled" : ""}>${active ? "Active" : unlocked ? "Travel" : "Unlock"}</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function render() {
  const rebirthBtn = document.getElementById("rebirthBtn");
  const rebirthInfo = document.getElementById("rebirthInfo");
  const unlocked = state.credits >= 10000;
  const mineBtn = document.getElementById("mineBtn");

  document.getElementById("credits").textContent = state.credits.toFixed(0);
  document.getElementById("power").textContent = state.power.toFixed(1);
  document.getElementById("robotCount").textContent = (state.miners + state.carriers + state.builders + state.defenders + state.aiBots).toFixed(0);
  document.getElementById("ore").textContent = state.ore.toFixed(1);
  document.getElementById("steel").textContent = state.steel.toFixed(1);
  document.getElementById("battery").textContent = state.battery.toFixed(1);
  document.getElementById("crystal").textContent = state.crystal.toFixed(1);
  document.getElementById("coreium").textContent = state.coreium.toFixed(1);
  document.getElementById("quantum").textContent = state.quantumCore.toFixed(1);
  document.getElementById("mission").textContent = state.mission;
  mineBtn.textContent = `⛏ Mine ${getPlanet().resource}`;

  rebirthBtn.disabled = !unlocked;
  rebirthBtn.classList.toggle("locked", !unlocked);
  rebirthBtn.textContent = unlocked ? `♻ Rebirth · x${getMultiplier().toFixed(2)}` : "🔒⛓ Rebirth";
  rebirthInfo.textContent = unlocked
    ? `Rebirth ready. Reset progress and gain a x${getMultiplier().toFixed(2)} boost.`
    : `Need 10,000 credits. Current rebirths: ${state.rebirths}`;

  renderFleet();
  renderBuildings();
  renderResearch();
  renderPlanets();
}

function bindEvents() {
  document.getElementById("mineBtn").addEventListener("click", mineOre);
  document.getElementById("smeltBtn").addEventListener("click", smeltSteel);
  document.getElementById("sellBtn").addEventListener("click", sellCargo);
  document.getElementById("toggleAutoBtn").addEventListener("click", toggleAutomation);
  document.getElementById("rebirthBtn").addEventListener("click", rebirth);
  document.getElementById("modalCloseBtn").addEventListener("click", hideInsufficientModal);
  document.getElementById("modalOverlay").addEventListener("click", (event) => {
    if (event.target.id === "modalOverlay") hideInsufficientModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideInsufficientModal();
  });
}

bindEvents();
render();
saveState();
setInterval(tick, 1000);
