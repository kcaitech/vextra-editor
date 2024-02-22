import { createApp, nextTick } from "vue"
import App from "./App.vue"
import i18n from "./i18n"
import SvgIcon from '@/components/common/SvgIcon.vue'
import "@/assets/icons/loadall"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/style/constant.scss'
// import '@/style/app.scss'
import { router } from "./router"
import '@/utils/permission'
const app = createApp(App)
app.use(i18n)
app.component('svg-icon', SvgIcon)
app.use(ElementPlus)
app.use(router)
app.directive('focus', {
    mounted: (el) => {
        el.focus()
        nextTick(() => {
            el.select()
        })
    }
})

app.mount("#app")
