// Works! 🎉
// TODO: dynamic enter and exit full screen on click

const fullscreenBtn = document.querySelector("#fullscreen");
fullscreenBtn.addEventListener("click", () => {
  const body = document.querySelector("body");
  body.requestFullscreen();
});
