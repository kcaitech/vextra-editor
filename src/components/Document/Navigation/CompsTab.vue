<script setup lang="ts">
import {} from "vue";
import { Context } from "@/context";
import developing from "@/assets/development.svg"
import { useI18n } from 'vue-i18n';
import ShowHiddenLeft from "./ShowHiddenLeft.vue";

const props = defineProps<{ context: Context, leftTriggleVisible: boolean, showLeft: boolean }>();
const { t } = useI18n();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
const showHiddenLeft = () => {
    emit('showNavigation')
}
</script>

<template>
    <div class="comps-container">
        <img :src="developing" alt="">
        <span class="text">{{t('navi.development')}}</span>
        <ShowHiddenLeft :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft"></ShowHiddenLeft>
    </div>
</template>

<style scoped lang="scss">
.comps-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #fff;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;
    overflow: hidden;
    >img {
        width: 224px;
        height: 224px;
    }
    .text {
        position: relative;
        top: -30px;
    }
}
</style>