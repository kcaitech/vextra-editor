import App from "./index.vue";
import Guide from "@/components/Display/GuideForServe.vue";
import '@/style/constant.scss';
import '@/style/app.scss';
import '@/utils/permission';
import { createApp } from "vue";
import SvgIcon from '@/components/common/SvgIcon.vue';
import i18n from "@/i18n";

const protocol = window.location.protocol;

if (protocol.startsWith('http')) {
    const app = createApp(App)
    app.use(i18n)
    app.component('svg-icon', SvgIcon)
    app.mount("#app");
} else if (protocol.startsWith('file')) {
    const app = createApp(Guide)
    app.use(i18n)
    app.mount("#app");
}