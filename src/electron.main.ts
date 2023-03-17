import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
// import './assets/icons/loadall'
import SvgIcon from '@/components/common/SvgIcon.vue'

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, (process.versions[type] || ''))
    }
})

const app = createApp(App)
app.use(i18n);
app.component('svg-icon', SvgIcon);
app.mount("#app");