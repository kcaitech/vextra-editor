// simple client

import { createApp, nextTick } from "vue";
import Client from "./Client.vue";

import { createI18n } from 'vue-i18n'
import {i18n as i18n_messages} from "@/index"

// todo
import ElementPlus from 'element-plus'

const i18n = createI18n({
    legacy: false,
    messages: i18n_messages,
})

const app = createApp(Client)
app.use(i18n)
app.use(ElementPlus)
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

app.directive('blur', {
    mounted: (el) => {
        el.addEventListener("change", () => {
            nextTick(() => {
               el.blur()
            })
        })
    }
})
app.mount("#app")