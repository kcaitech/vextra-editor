<script setup lang="ts">
// import UserAvatar from '../../Document/Toolbar/UserAvatar.vue';
// import Share from '../../Document/Toolbar/Share/Share.vue';
import Scale from './PreviewScale.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { Context } from '@/context';
// import kcdesk from '@/kcdesk';
// import { SCREEN_SIZE } from '@/settings';
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
interface Props {
    context: Context
}
const { t } = useI18n()
const props = defineProps<Props>();
const isFull = ref<boolean>(false);

const switchFullScreen = () => {
    // if (kcdesk) return;
    // const element = document.documentElement;
    // const isFullScreen = document.fullscreenElement;
    // if (isFullScreen === null) {
    //     element.requestFullscreen && element.requestFullscreen();
    //     localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.FULL);
    // } else {
    //     document.exitFullscreen && document.exitFullscreen();
    //     localStorage.setItem(SCREEN_SIZE.KEY, SCREEN_SIZE.NORMAL);
    // }
}

// const openFill = () => {
//     const href = window.location.href;
//     const url = href.replace(/prototype/, 'document');
//     const p_window = props.context.preview.previewWindow;

//     if (p_window && !p_window.closed) {
//         p_window.location.href = url;
//         p_window.focus();
//     } else {
//         const newWindow = window.open(url);
//         if (newWindow) props.context.preview.setPreviewWindow(newWindow);
//     }
// }


const watchFull = () => {
    if (document.fullscreenElement) {
        isFull.value = true;
    } else {
        isFull.value = false;
    }
}

onMounted(() => {
    document.addEventListener('fullscreenchange', watchFull);
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', watchFull);
})
const plugins = props.context.pluginsMgr.search2('preview.toolbar.others');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin)
comps.push({ component: Scale })
comps.push(...plugins.end)
</script>
<template>
    <div class="user-info" @dblclick.stop>
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
    </div>
</template>

<style scoped lang="scss">
.user-info {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: absolute;
    right: 0px;

    div {
        margin: auto 0 auto 8px;
    }

    .full {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        svg {
            width: 18px;
            height: 18px;
        }
    }
}
</style>