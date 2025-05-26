/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

// simple client

import { createApp, nextTick } from "vue";
import Client from "./Client.vue";

import { createI18n } from 'vue-i18n'
import {i18n as i18n_messages} from "@/index"

// todo
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

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