// TODO:
// poor browser support
// e.g. different in Brave versus Chrome
// it does read values, but they don't make total sense
// e.g. `batteryRemaining: Infinity` while at 100% charge
// the chargingTime property apparently doesn't even have a specified unit

window.addEventListener("load", async () => {
  const batteryManager = await navigator.getBattery();

  const level = batteryManager.level * 100;
  const charging = batteryManager.charging;
  const chargingTime = batteryManager.chargingTime;
  const dischargingTime = batteryManager.dischargingTime;

  const levelLi = document.querySelector("li#battery-level");
  const levelProgress = document.querySelector("li#battery-level > progress");
  levelLi.innerText += ` ${level}%`;
  levelProgress.setAttribute("value", "level");

  const isChargingLi = document.querySelector("li#is-battery-charging");
  isChargingLi.innerText += ` ${charging ? "Yes" : "No"}`;

  const chargingTimeLi = document.querySelector("li#battery-charging-time");
  chargingTimeLi.innerText += ` ${chargingTime}`;

  const dischargingTimeLi = document.querySelector(
    "li#battery-discharging-time"
  );
  dischargingTimeLi.innerText += ` ${dischargingTime}`;
});
