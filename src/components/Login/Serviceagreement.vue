<template>
    <AgreementBaseComponent>
        <div class="content" v-html="htmlContent(Markdowncontent)"></div>
    </AgreementBaseComponent>

</template>

<script setup lang="ts">
import { htmlContent } from "@/utils/showmarkdown";
import Markdowncontent from "@/assets/serviceagreement.md";
import { onMounted } from "vue";
import isMobileDevice from '@/utils/mobileDeviceChecker'
import AgreementBaseComponent from '@/components/Login/AgreementBaseComponent.vue';

function changeFontSize(el: any) {
    for (let index = 0; index < el.length; index++) {
        const element = el[index];
        if (isMobileDevice()) {
            if (element.tagName === 'H1') {
                element.style.fontSize = '24px'
            } else if (element.tagName === 'H2') {
                element.style.fontSize = '18px'
            } else if (element.tagName === 'P' || element.tagName === 'LI') {
                element.style.fontSize = '14px'
                element.style.lineHeight = '24px'
            }
        }
    }
}

onMounted(() => {
    const el = document.querySelectorAll('h1')
    const el2 = document.querySelectorAll('h2')
    const el3 = document.querySelectorAll('p')
    const el4 = document.querySelectorAll('li')
    changeFontSize(el)
    changeFontSize(el2)
    changeFontSize(el3)
    changeFontSize(el4)
})
</script>

<style lang="scss" scoped>
.content {
    margin: auto;
    color: #333333;
    max-width: 880px;
    letter-spacing: 1px;
}

@media (max-width:880px) {
    .content {
        margin: 0;
        padding: 0 12px;
        box-sizing: border-box;
    }

}
</style>
