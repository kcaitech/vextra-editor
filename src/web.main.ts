import { createApp, nextTick } from "vue"
import App from "./App.vue"
import i18n from "./i18n"
import SvgIcon from '@/components/common/SvgIcon.vue'
import "@/assets/icons/loadall"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/style/constant.scss'
import '@/style/app.scss'
import { router } from "./router"
import { createPinia } from 'pinia'
import '@/utils/permission'
import 'animate.css';
import '@/assets/fonts/index.css'

const pinia = createPinia()
import * as settings from "@/settings"

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

app.directive('select', {
    mounted: (el) => {
        el.addEventListener("focus", () => {
            nextTick(() => {
                el.setSelectionRange(0,0)
                el.select()
            })
        })
    }
})

app.use(pinia)
app.mount("#app")

// 屏蔽掉普通log输出
if (settings.production) {

    const _commonlog = console.log;
    const _silentlog = (...args: any[]) => {
        // 把异常打印出来
        for (let i = 0; i < args.length; ++i) {
            if (args[i] instanceof Error) return _commonlog(...args);
        }
    };
    const switchlog = () => {
        const href = window.location.href || '';
        const idx = href.indexOf('?debug');
        if (idx < 0) console.log = _silentlog;
        else console.log = _commonlog;
    }

    window.addEventListener('hashchange', switchlog);
    switchlog();

    (window as any)._switchlog = () => {
        const _log = console.log;
        if (_log === _silentlog) console.log = _commonlog;
        else if (_log === _commonlog) console.log = _silentlog;
    }; // for electron
}
