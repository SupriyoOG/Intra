// Fullscreen prompt
const fullscreen_container = document.getElementById("fullscreen");

if (!sessionStorage.getItem("fullscreenPrompt")) {
  fullscreen_container.style.display = "flex"; // Show fullscreen_container content
  sessionStorage.setItem("fullscreenPrompt", "shown"); // Prevent showing prompt again
}

function toggleFullscreen(confirm = false) {
  if (confirm) {
    if (document.documentElement.requestFullscreen)
      document.documentElement.requestFullscreen();
  }
  fullscreen_container.style.display = "none"; // Hide prompt
}

// Button sounds (hover and click)
const buttonClickSound = new Audio("res/click.mp3");
const buttonHoverSound = new Audio("res/hover.mp3");

document.querySelectorAll("button").forEach((button) => {
  button.onmouseover = () => {
    buttonHoverSound.currentTime = 0;
    buttonHoverSound.play();
    buttonHoverSound.volume = 0.1;
  };

  button.onmousedown = () => {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play();
    buttonClickSound.volume = 1;
  };
});

// Info tab functionality
const info_tab = document.getElementById("info-tab");
const closeBtn = document.getElementById("close");

closeBtn.addEventListener("click", () => {
  info_tab.style.transform = "translate(-100%)"; // Hide the info tab when close is clicked
});