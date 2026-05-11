const welcomes = [
  "Hello",
  "Witaj",
  "Bonjour",
  "Hola",
  "Ciao",
  "Hallo",
  "こんにちは",
  "안녕하세요",
  "Привет",
  "مرحبا",
  "שלום",
  "नमस्ते",
  "Olá"
];

const bootScreen = document.querySelector(".boot-screen");
const splash = document.querySelector(".splash-screen");
const setupScreen = document.querySelector(".setup-screen");
const progress = document.querySelector(".progress");
const welcomeText = document.getElementById("welcome-text");

let current = 0;

setTimeout(() => {
  splash.classList.add("hide");

  setTimeout(() => {
    splash.style.display = "none";
    setupScreen.classList.add("show");

    typeWelcome();
    setInterval(typeWelcome, 3500);
  }, 1200);

}, 6000);

function typeWelcome() {
  const word = welcomes[current];

  welcomeText.innerHTML = "";

  let i = 0;

  const typing = setInterval(() => {
    welcomeText.innerHTML += word[i];
    i++;

    if (i >= word.length) {
      clearInterval(typing);

      setTimeout(() => {
        eraseText();
      }, 1200);
    }
  }, 140);

  current = (current + 1) % welcomes.length;
}

function eraseText() {
  const text = welcomeText.innerHTML;

  let length = text.length;

  const erasing = setInterval(() => {
    welcomeText.innerHTML = text.substring(0, length - 1);

    length--;

    if (length < 0) {
      clearInterval(erasing);
    }
  }, 70);
}