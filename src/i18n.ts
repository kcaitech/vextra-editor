// https://juejin.cn/post/7029609093539037197
import { createI18n } from 'vue-i18n'
const i18n = createI18n({
    locale: localStorage.getItem('locale') || 'zh',
    legacy: false,
    //this.$i18n.locale // 通过切换locale的值来实现语言切换
    messages: {//引入语言包
        'zh': require("@/assets/lang/zh"),   // 中文语言包
        'en': require('@/assets/lang/en'),    // 英文语言包
    }
})
export default i18n;