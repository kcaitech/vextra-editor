<script setup lang='ts'>
import { Context } from '@/context';
import { onMounted, onUnmounted, ref } from 'vue';
import { Preview, ScaleType } from '@/context/preview';
import MenuVue from '@/components/Display/PreviewMenu.vue';
import { useI18n } from 'vue-i18n';
import SvgIcon from '@/components/common/SvgIcon.vue';
interface Props {
    context: Context
}
const { t } = useI18n()
const props = defineProps<Props>();
let scale = ref<string>('100');
const isMenu = ref(false);
const scaleType = ref<ScaleType>();
function init() {
    scale.value = (props.context.preview.scale * 100).toFixed(0);
}
function watcher(t: any) {
    if (t === Preview.MATRIX_SCALE) {
        scale.value = (props.context.preview.scale * 100).toFixed(0);
    } else if (t === Preview.MENU_CHANGE) {
        updateScaleType();
    }
}
const showMenu = (e: MouseEvent) => {
    e.stopPropagation();
    if (isMenu.value) {
        isMenu.value = false;
    } else {
        props.context.preview.notify(Preview.MENU_VISIBLE);
        isMenu.value = true;
    }
    console.log(isMenu.value);
    
}

const closeMenu = () => {
    isMenu.value = false;
}

const updateScaleType = () => {
    const type = props.context.preview.scaleType;
    scaleType.value = type;
}

onMounted(() => {
    updateScaleType();
    props.context.preview.watch(watcher);
    init();
})
onUnmounted(() => {
    props.context.preview.watch(watcher);
})

import down_icon from '@/assets/icons/svg/down.svg';
</script>
<template>
    <div class="scale-display-warp" @click="showMenu">
        <span ref="inputSpan" v-if="scaleType === ScaleType.Actual || !scaleType">{{ scale }}%</span>
        <span ref="inputSpan" v-else>{{ t(`preview.${scaleType}`) }}</span>
        <div class="down">
            <SvgIcon :icon="down_icon"/>
        </div>
        <MenuVue :context="context" :top="50" :left="5" :isDown="true" v-if="isMenu" @close="closeMenu"></MenuVue>
    </div>
</template>
<style lang='scss' scoped>
.scale-display-warp {
    width: 86px;
    height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #FFFFFF;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--default-radius);
    box-sizing: border-box;
    padding-left: 8px;

    &:hover {
        background-color: #4a4a4a;
    }

    span {
        white-space: nowrap;
        line-height: 32px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .down {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 32px;

        img {
            fill: #FFFFFF;
            width: 14px;
            height: 14px;
        }
    }
}
</style>