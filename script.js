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

let playerColors = ["#ff4c4c","#4caf50","#2196f3","#ff9800"]; // customizable colors

// Popup
document.getElementById("popupOk").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none";
});

// Generate input fields for player names
document.getElementById("playerCount").addEventListener("change", () => {
  let count = Number(document.getElementById("playerCount").value);
  const container = document.getElementById("playerNamesContainer");
  container.innerHTML = '';
  for(let i=0;i<count;i++){
    let div = document.createElement("div");
    div.innerHTML = `<label>Player ${i+1} Name: <input id="playerName${i}" placeholder="Player ${i+1}" /></label>`;
    container.appendChild(div);
  }
});

function startGame() {
  let count = Number(document.getElementById("playerCount").value);
  gameMode = document.getElementById("gameMode").value;
  modeValue = Number(document.getElementById("modeValue").value);

  players = [];
  for (let i = 0; i < count; i++) {
    let nameInput = document.getElementById(`playerName${i}`);
    let name = nameInput && nameInput.value ? nameInput.value : `Player ${i+1}`;
    players.push({ money: 1000, name: name, color: playerColors[i] || "#fff" });
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
  let infoBar = document.getElementById("infoBar");
  infoBar.innerText = `Turn ${turn} | ${players[currentPlayer].name} | Money: $${players[currentPlayer].money.toFixed(2)}`;
  infoBar.style.background = players[currentPlayer].color;
  infoBar.classList.add("playerTurn");

  setTimeout(()=> infoBar.classList.remove("playerTurn"), 1000);

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
      <td>${[1,5,10,20,100].map(n => `<button onclick="buy(${i},${n})">+${n}</button>`).join("")}</td>
      <td><button onclick="sell(${i})">Sell</button></td>
    `;
    tbody.appendChild(row);
  });
}

function buy(i, amount) {
  if (actionTracker[i] === "sell") return popup("You cannot buy and sell the same stock in one turn!");
  let s = stocks[i];
  let cost = s.price * amount;
  if (players[currentPlayer].money < cost) return popup("Not enough money");
  players[currentPlayer].money -= cost;
  s.owned[currentPlayer] += amount;
  actionTracker[i] = "buy";
  render();
}

function sell(i) {
  if (actionTracker[i] === "buy") return popup("You cannot buy and sell the same stock in one turn!");
  let s = stocks[i];
  if (s.owned[currentPlayer] <= 0) return popup("No stocks to sell");
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
  if (players[currentPlayer].money < 0) forceSell();
  checkWin();
  render();
}

function updateMarket() {
  stocks.forEach(s => {
    let change = (Math.random()*2-1)*s.volatility*s.price;
    s.price += change;
    s.price = Math.max(1, Math.min(500, s.price));
    s.change = change;
  });
}

function applyDividends() {
  players.forEach((p, pi)=>{
    stocks.forEach(s=>{
      let owned = s.owned[pi];
      let value = owned*s.price;
      let rate=0;
      if(owned>=1000) rate=0.1;
      else if(owned>=500) rate=0.075;
      else if(owned>=100) rate=0.05;
      p.money += value*rate;
    });
  });
}

function randomEvent(){
  if(turn<10) return;
  if(Math.random()>0.15) return;
  let events = [
    {text:"Crashed car", value:-500},{text:"Gift", value:200},{text:"Repairs", value:-100},
    {text:"Clothes", value:-50},{text:"Phone broken", value:-240},{text:"Birthday", value:75},
    {text:"Furniture", value:-300},{text:"Bills", value:-615},{text:"Tax return", value:150}
  ];
  let e = events[Math.floor(Math.random()*events.length)];
  players[currentPlayer].money += e.value;
  popup(`${e.text}: $${e.value}`);
}

function forceSell(){ popup("You have negative money! Sell stocks!"); }

function checkWin(){
  if(gameMode==="turns" && turn>modeValue) return endGame(true);
  if(gameMode==="money" && players.some(p=>p.money>=modeValue)) return endGame(true);
}

function endGame(force=false){
  if(force){
    let scores = players.map((p,i)=>{
      let total = p.money;
      stocks.forEach(s=>total+=s.owned[i]*s.price);
      return {total: total, name: p.name, color:p.color};
    });
    scores.sort((a,b)=>b.total-a.total);

    // show podium
    document.getElementById("game").classList.add("hidden");
    const podium = document.getElementById("podium");
    podium.classList.remove("hidden");

    document.getElementById("firstPlace").innerText = scores[0].name;
    document.getElementById("firstPlace").style.background = "gold";
    document.getElementById("secondPlace").innerText = scores[1]?scores[1].name:"";
    document.getElementById("secondPlace").style.background = "silver";
    document.getElementById("thirdPlace").innerText = scores[2]?scores[2].name:"";
    document.getElementById("thirdPlace").style.background = "#cd7f32";

    popup(`${scores[0].name} wins!`);
  } else {
    resetGame();
  }
}

function resetPodium(){
  resetGame();
  document.getElementById("podium").classList.add("hidden");
}

function resetGame(){
  document.getElementById('setup').classList.remove('hidden');
  document.getElementById('game').classList.add('hidden');
  document.getElementById('infoBar').innerText = '';
  document.querySelector('#stockTable tbody').innerHTML = '';
  document.getElementById('popupContent').innerText = '';
  document.getElementById('popup').style.display = 'none';
  players=[]; currentPlayer=0; turn=1; actionTracker={};
  gameMode="turns"; modeValue=20;
  document.getElementById('playerCount').value="2";
  document.getElementById('gameMode').value="turns";
  document.getElementById('modeValue').value="";
}

function toggleInfo(i){
  popup(stocks[i].desc);
}

function popup(text){
  const popupEl = document.getElementById("popup");
  document.getElementById("popupContent").innerText = text;
  popupEl.style.display='flex';
}
