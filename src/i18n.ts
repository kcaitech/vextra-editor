// https://juejin.cn/post/7029609093539037197
import { createI18n } from 'vue-i18n'
import { locale } from './locale';

import * as lang_zh from "@/assets/lang/zh";
import * as lang_en from "@/assets/lang/en";
const i18n = createI18n({
    locale,
    legacy: false,
    //this.$i18n.locale // 通过切换locale的值来实现语言切换
    messages: {//引入语言包
        'zh': lang_zh,   // 中文语言包
        'en': lang_en,    // 英文语言包
    },
})
export default i18n;


/*
在ts中使用
import i18n from '@/i18n'
import { ElMessage } from 'element-plus'

export async function doTest() {
  ElMessage({
    message: i18n.global.t('message.hello')
  })
  console.log(i18n.global.t('message.hello'))
}

在vue中使用
<script lang="ts" setup>
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()
    console.log('i18n', t('message.hello'))
</script>

<template>
    {{ $t("message.hello") }}
</template>

*/
