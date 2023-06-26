import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import SvgIcon from '@/components/common/SvgIcon.vue';
import "@/assets/icons/loadall";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/style/constant.scss';
import '@/style/app.scss';
import { router } from "./router";
import '@/utils/permission'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import VueVirtualScroller from 'vue-virtual-scroller'

const app = createApp(App)
app.component('RecycleScroller', RecycleScroller)
app.use(i18n);
app.use(VueVirtualScroller)
app.component('svg-icon', SvgIcon);
app.use(ElementPlus)
app.use(router);
app.mount("#app");
