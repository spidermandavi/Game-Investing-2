let players = [];
let currentPlayer = 0;
let turn = 1;
let actionTracker = {};

let gameMode = "turns";
let modeValue = 20;

let stocks = [
  { name: "CDJ", price: 10, volatility: 0.05, owned: {}, desc: "Clothing company, medium risk." },
  { name: "Panda & Co.", price: 10, volatility: 0.02, owned: {}, desc: "Stable bank." },
  { name: "GRAY-BOX", price: 10, volatility: 0.02, owned: {}, desc: "Safe insurance." },
  { name: "BA", price: 10, volatility: 0.12, owned: {}, desc: "Very volatile sports brand." },
  { name: "SEED", price: 10, volatility: 0.06, owned: {}, desc: "Agriculture, event-driven." },
  { name: "EXTRA FRESH", price: 10, volatility: 0.04, owned: {}, desc: "Food, steady growth." }
];

// Attach popup OK button
document.getElementById("popupOk").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none";
});

function startGame() {
  let count = Number(document.getElementById("playerCount").value);
  gameMode = document.getElementById("gameMode").value;
  modeValue = Number(document.getElementById("modeValue").value);

  players = [];
  for (let i = 0; i < count; i++) {
    players.push({ money: 1000 });
  }

  stocks.forEach(s => {
    players.forEach((_, i) => s.owned[i] = 0);
  });

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  currentPlayer = 0;
  turn = 1;
  resetTurn();
  render();
}

function resetTurn() {
  actionTracker = {};
}

function render() {
  let info = `Turn ${turn} | Player ${currentPlayer + 1} | Money: $${players[currentPlayer].money.toFixed(2)}`;
  document.getElementById("infoBar").innerText = info;

  let tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML = "";

  stocks.forEach((s, i) => {
    let row = document.createElement("tr");

    let changeClass = "neutral";
    if (s.change > 0) changeClass = "green";
    if (s.change < 0) changeClass = "red";

    row.innerHTML = `
      <td onclick="toggleInfo(${i})">${s.name}</td>
      <td>$${s.price.toFixed(2)}</td>
      <td class="${changeClass}">${s.change ? s.change.toFixed(2) : 0}</td>
      <td>${s.owned[currentPlayer]}</td>
      <td>
        ${[1,5,10,20,100].map(n => `<button onclick="buy(${i},${n})">+${n}</button>`).join("")}
      </td>
      <td>
        <button onclick="sell(${i})">Sell</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function buy(i, amount) {
  if (actionTracker[i] === "sell") {
    popup("You cannot buy and sell the same stock in one turn!");
    return;
  }

  let s = stocks[i];
  let cost = s.price * amount;

  if (players[currentPlayer].money < cost) {
    popup("Not enough money");
    return;
  }

  players[currentPlayer].money -= cost;
  s.owned[currentPlayer] += amount;
  actionTracker[i] = "buy";

  render();
}

function sell(i) {
  if (actionTracker[i] === "buy") {
    popup("You cannot buy and sell the same stock in one turn!");
    return;
  }

  let s = stocks[i];

  if (s.owned[currentPlayer] <= 0) {
    popup("No stocks to sell");
    return;
  }

  s.owned[currentPlayer]--;
  players[currentPlayer].money += s.price;
  actionTracker[i] = "sell";

  render();
}

function endTurn() {
  currentPlayer++;

  if (currentPlayer >= players.length) {
    currentPlayer = 0;
    turn++;
    updateMarket();
    applyDividends();
    randomEvent();
  }

  resetTurn();

  if (players[currentPlayer].money < 0) {
    forceSell();
  }

  checkWin();
  render();
}

function updateMarket() {
  stocks.forEach(s => {
    let change = (Math.random() * 2 - 1) * s.volatility * s.price;
    s.price += change;
    s.price = Math.max(1, Math.min(500, s.price));
    s.change = change;
  });
}

function applyDividends() {
  players.forEach((p, pi) => {
    stocks.forEach(s => {
      let owned = s.owned[pi];
      let value = owned * s.price;
      let rate = 0;
      if (owned >= 1000) rate = 0.10;
      else if (owned >= 500) rate = 0.075;
      else if (owned >= 100) rate = 0.05;
      p.money += value * rate;
    });
  });
}

function randomEvent() {
  if (turn < 10) return;
  if (Math.random() > 0.15) return;

  let events = [
    { text: "Crashed car", value: -500 },
    { text: "Gift", value: 200 },
    { text: "Repairs", value: -100 },
    { text: "Clothes", value: -50 },
    { text: "Phone broken", value: -240 },
    { text: "Birthday", value: 75 },
    { text: "Furniture", value: -300 },
    { text: "Bills", value: -615 },
    { text: "Tax return", value: 150 }
  ];

  let e = events[Math.floor(Math.random() * events.length)];
  players[currentPlayer].money += e.value;

  popup(e.text + ": $" + e.value);
}

function forceSell() {
  popup("You have negative money! Sell stocks!");
}

function checkWin() {
  if (gameMode === "turns" && turn > modeValue) endGame(true);
  if (gameMode === "money") {
    if (players.some(p => p.money >= modeValue)) endGame(true);
  }
}

function endGame(force = false) {
  // Show winner if game ended naturally
  if (force) {
    let scores = players.map((p, i) => {
      let total = p.money;
      stocks.forEach(s => total += s.owned[i] * s.price);
      return total;
    });
    let winner = scores.indexOf(Math.max(...scores));
    popup("Player " + (winner + 1) + " wins!");
  }

  // Reset UI
  document.getElementById('game').classList.add('hidden');
  document.getElementById('setup').classList.remove('hidden');
  document.getElementById('infoBar').innerText = '';
  document.querySelector('#stockTable tbody').innerHTML = '';
  document.getElementById('popupContent').innerText = '';
  document.getElementById('popup').style.display = 'none';

  // Reset variables
  players = [];
  currentPlayer = 0;
  turn = 1;
  actionTracker = {};
  gameMode = "turns";
  modeValue = 20;

  // Reset input fields
  document.getElementById('playerCount').value = "2";
  document.getElementById('gameMode').value = "turns";
  document.getElementById('modeValue').value = "";
}

function toggleInfo(i) {
  popup(stocks[i].desc);
}

function popup(text) {
  const popupEl = document.getElementById("popup");
  document.getElementById("popupContent").innerText = text;
  popupEl.style.display = 'flex';
}
