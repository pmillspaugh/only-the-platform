// TODO: clean up console logs

window.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.querySelector("button#register-sw");
  const unregisterBtn = document.querySelector("button#unregister-sw");

  registerBtn.addEventListener("click", registerServiceWorker);
  unregisterBtn.addEventListener("click", unregisterServiceWorker);
});

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length) {
      console.log(
        `Already registered ${registrations.length} service workers. Skipping registration.`
      );
      return;
    }

    try {
      await navigator.serviceWorker.register("serviceWorker.js");
      console.log("Registered service worker!");
    } catch (error) {
      console.error("Service worker registration error: ", error);
    }
  }
}

async function unregisterServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const result = await registration.unregister();
        console.log(
          result
            ? "Unregistered service worker"
            : "Unable to unregister service worker"
        );
      } else {
        console.log("No service worker to unregister");
      }
    } catch (error) {
      console.error("Service worker unregistration error: ", error);
    }
  }
}
