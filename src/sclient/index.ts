// simple client

import { createApp } from "vue";
import SClient from "./SClient.vue";
import SvgIcon from "./SvgIcon.vue";
import i18n from "../i18n";
import ElementPlus from 'element-plus'
import '@/style/constant.scss'
import '@/style/app.scss'

// load all icons
(import.meta as any).glob('../assets/icons/svg/*.svg', { eager: true })

const app = createApp(SClient)
app.use(i18n)
app.component('svg-icon', SvgIcon)
app.mount("#app")
app.use(ElementPlus)