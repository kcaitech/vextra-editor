import App from "./index.vue";
import '@/style/constant.scss';
import '@/style/app.scss';
import '@/utils/permission';
import { createApp } from "vue";
import i18n from "@/i18n";

const app = createApp(App)
app.use(i18n)
app.mount("#app");