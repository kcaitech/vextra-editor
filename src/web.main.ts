import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import SvgIcon from '@/components/common/SvgIcon.vue'
import "@/assets/icons/loadall"

const app = createApp(App)
app.use(i18n);
app.component('svg-icon', SvgIcon);
app.mount("#app");
