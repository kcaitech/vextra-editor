import { createApp } from "vue";
import { preload } from "./preload";
import App from "./App.vue";

const app = createApp(App, {preload})
app.mount("#app");

