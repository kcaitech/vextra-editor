import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import SvgIcon from '@/components/common/SvgIcon.vue';
import "@/assets/icons/loadall";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/style/index.scss';
import "@/assets/icons/loadall"

const app = createApp(App)
app.use(i18n);
app.component('svg-icon', SvgIcon);
app.use(ElementPlus)
app.mount("#app");
