// ===== UI =====

// Popup fix
document.getElementById("popupOk").onclick = () => {
  document.getElementById("popup").classList.add("hidden");
};

function popup(text){
  const popupEl = document.getElementById("popup");
  document.getElementById("popupContent").innerText = text;
  popupEl.classList.remove("hidden");
}

// Player input generator
document.getElementById("playerCount").addEventListener("change", () => {
  let count = Number(document.getElementById("playerCount").value);
  const container = document.getElementById("playerNamesContainer");

  container.innerHTML = '';

  for(let i=0;i<count;i++){
    let div = document.createElement("div");
    div.innerHTML = `<label>Player ${i+1} Name: 
      <input id="playerName${i}" placeholder="Player ${i+1}" />
    </label>`;
    container.appendChild(div);
  }
});

function render() {
  let infoBar = document.getElementById("infoBar");

  infoBar.innerText = `Turn ${turn} | ${players[currentPlayer].name} | Money: $${players[currentPlayer].money.toFixed(2)}`;
  infoBar.style.background = players[currentPlayer].color;

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

function toggleInfo(i){
  popup(stocks[i].desc);
}

// Podium UI
function showPodium(scores){
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
}

function resetPodium(){
  resetGame();
  document.getElementById("podium").classList.add("hidden");
}
