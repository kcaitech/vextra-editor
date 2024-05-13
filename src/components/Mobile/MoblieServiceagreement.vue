<template>
    <div class="serviceagreement">
        <!-- <div ref="hdow" class="header">
            <svg-icon icon-class="back-icon" @click="router.go(-1)"></svg-icon>
            <span>{{ t('miniprogram.serve') }}</span>
        </div> -->
        <div ref="cdow" class="content" v-html="htmlContent(Markdowncontent)" @scroll="scrollevent"></div>
    </div>
</template>

<script setup lang="ts">
import { htmlContent } from "@/utils/showmarkdown";
import Markdowncontent from "@/assets/serviceagreement.md";
import { router } from '@/router'
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n()
const hdow = ref<HTMLElement>()
const cdow = ref<HTMLElement>()
const scrollevent = (el: Event) => {
    if ((el.target as HTMLElement).scrollTop > 0) {
        if (hdow.value?.style) {
            hdow.value.style!.boxShadow = '0 0 5px silver'
        }
    } else {
        if (hdow.value?.style) {
            hdow.value.style!.boxShadow = ''
        }

    }
}
</script>

<style lang="scss" scoped>
.serviceagreement {
    height: 100%;
    width: 100%;
    background-color: #fff;


    .header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 44px;
        transition: all 0.25s ease-in;

        svg {
            position: absolute;
            width: 28px;
            height: 28px;
            left: 14px;
        }

        span {}
    }

    .content {
        height: 100%;
        overflow-y: scroll;
        padding: 0 14px;
        color: #333333;
        letter-spacing: 1px;
    }
}

@media screen and (max-width:768px) {
    .content {
        font-size: 13px;
    }
}
</style>
