const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuButton.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
const typingText = document.getElementById("typing-text");

const words = [
    "AI & Data Science Enthusiast",
    "Python Developer",
    "Machine Learning Enthusiast",
    "Data Science Learner"
];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {
    const currentWord = words[wordIndex];

    typingText.textContent = deleting
        ? currentWord.substring(0, charIndex--)
        : currentWord.substring(0, charIndex++);

    let speed = deleting ? 50 : 100;

    if (!deleting && charIndex > currentWord.length) {
        deleting = true;
        speed = 1200;
    } else if (deleting && charIndex < 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        charIndex = 0;
    }

    setTimeout(typeEffect, speed);
}

if (typingText) {
    typeEffect();
}
