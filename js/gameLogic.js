// ===== GAME STATE =====
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

let playerColors = ["#ff4c4c","#4caf50","#2196f3","#ff9800"];

// ===== GAME FUNCTIONS =====

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

function forceSell(){ 
  popup("You have negative money! Sell stocks!"); 
}

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

    showPodium(scores); // moved to UI
  } else {
    resetGame();
  }
}

function resetGame(){
  document.getElementById('setup').classList.remove('hidden');
  document.getElementById('game').classList.add('hidden');

  players=[]; currentPlayer=0; turn=1; actionTracker={};
}
