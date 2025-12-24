const SECRET = "giappone"; // risposta segreta (lowercase)

function checkSecret() {
  const value = document.getElementById("secretInput").value.toLowerCase().trim();
  if (value === SECRET) {
    goTo("start");
  } else {
    alert("Hmm… riprova 🤍");
  }
}

function startExperience() {
  document.getElementById("music").play();
  goTo("step1");
}

const text = "Per te, questo Natale 🎄";
let index = 0;

function typeEffect() {
  if (index < text.length) {
    document.getElementById("typing").innerHTML += text.charAt(index);
    index++;
    setTimeout(typeEffect, 80);
  }
}

function goTo(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "start") {
    document.getElementById("typing").innerHTML = "";
    index = 0;
    typeEffect();
  }
}

function answer(step, correct) {
  const stepEl = document.getElementById(`step${step}`);
  const error = stepEl.querySelector(".error");
  const reward = stepEl.querySelector(".reward");

  if (correct) {
    if (error) error.classList.add("hidden");
    reward.classList.remove("hidden");
  } else {
    if (error) error.classList.remove("hidden");
  }
}
