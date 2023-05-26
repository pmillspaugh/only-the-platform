// TODO:
// Might be worth figuring out how to make this change global
// Probably not worth the time, though
// It'd need to be stored on the server

const htmlRoot = document.documentElement;
const bgColorPicker = document.querySelector("input#bg-color-picker");
const textColorPicker = document.querySelector("input#text-color-picker");

bgColorPicker.addEventListener("input", (event) => {
  htmlRoot.style.setProperty("--bg-color", event.target.value);
});

textColorPicker.addEventListener("input", (event) => {
  htmlRoot.style.setProperty("--text-color", event.target.value);
});
