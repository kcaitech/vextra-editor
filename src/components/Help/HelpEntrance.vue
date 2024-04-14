<template>
    <div v-if="showhelp" class="help-container">
        <div class="help-content" @click.stop="handleClickShowhelp">
            <svg-icon icon-class="help-icon"></svg-icon>
        </div>
        <Teleport to="body">
            <div v-if="showitem" class="help-item">
                <div v-for="(item, index) in items" :key="index" class="item" @click.stop="handleClickShow(index)">
                    <svg-icon :icon-class="itemsicon[index]"></svg-icon>
                    {{ item }}
                </div>
            </div>
        </Teleport>
        <Teleport to="body">
            <div v-if="qrcode" class="qq-grop-code">
                <div class="qr-code">
                    <img class="code-image" :src="QRCode" alt="QRCode">
                </div>
            </div>
            <div v-if="report" class="overlay">
                <Report @close="report = false"></Report>
            </div>
            <ShortCut v-if="shortcut" @close="shortcut = false" :b="shortcut"></ShortCut>
        </Teleport>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import QRCode from '@/assets/qr-code.png';
import ShortCut from './ShortCut.vue';
import Report from './Report.vue'
import { Context } from '@/context';
import { onUnmounted } from 'vue';
import { Menu } from '@/context/menu';

const props = defineProps<{
    context?: Context
}>();

const route = useRoute()
const showitem = ref(false)
const qrcode = ref(false)
const shortcut = ref(false)
const report = ref(false)
const items = ref<any[]>(['问题反馈', '举报', '快捷键介绍'])//['问题反馈', '举报', '快捷键介绍']
const itemsicon = ref<any[]>(['feedback-icon', 'report-icon', 'shortcut-icon'])


const showhelp = computed(() => {
    return route.path.includes('/document') || route.path.includes('/files')
})

const handleClickShowhelp = () => {
    if (qrcode.value || shortcut.value) {
        qrcode.value = false
        shortcut.value = false
        return
    }

    showitem.value = !showitem.value;
    if (showitem.value) {
        props.context?.esctask.save('handleClickShowhelp', () => {
            const achieve = showitem.value;
            showitem.value = false;
            return achieve;
        })
    }
}

const handleClickOutside = (e: MouseEvent) => {
    if (showitem.value) {
        if (!(e.target as HTMLElement).closest('.help-item')) {
            showitem.value = false
        }
    }
    if (qrcode.value) {
        if (!(e.target as HTMLElement).closest('.qq-grop-code')) {
            qrcode.value = false
        }
    }
}

const handleClickShow = (index: number) => {
    showitem.value = false
    if (index === 0) {
        qrcode.value = true
        shortcut.value = false
        report.value = false
    } else if (index === 1) {
        qrcode.value = false
        shortcut.value = false
        report.value = true
    } else if (index === 2) {
        report.value = false
        qrcode.value = false
        shortcut.value = true
    }
}

watch([qrcode, showitem], ([newvalue1, newvalue2]) => {
    if (newvalue1 || newvalue2) {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("contextmenu", handleClickOutside);
    } else {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("contextmenu", handleClickOutside);
    }
})
const menu_watcher = (t: number) => {
    if(t === Menu.OPEN_SHORTCUTS) {
        handleClickShow(2);
    }
}
onMounted(() => {
    if(props.context) {
        props.context.menu.watch(menu_watcher);
    }
})
onUnmounted(() => {
    if(props.context) {
        props.context.menu.unwatch(menu_watcher);
    }
})

</script>
<style lang="scss" scoped>
.overlay {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: var(--overlay-bg-color);
}

.help-container {
    position: fixed;
    bottom: 16px;
    right: 20px;
    padding: 2px;
    z-index: 9999;

    .help-content {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: rgba(33, 33, 33, 1);
        box-shadow: 0px 4px 15px 0px rgba(0, 0, 0, 0.1);

        svg {
            width: 24px;
            height: 24px;
            color: white;
        }
    }
}

.help-item {
    position: fixed;
    bottom: 66px;
    right: 20px;
    font-size: 12px;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    z-index: 9999;

    .item {
        cursor: pointer;
        display: flex;
        align-items: center;
        line-height: 40px;
        padding: 0 16px;
        gap: 8px;

        svg {
            width: 20px;
            height: 20px;
        }

        &:hover {
            background: rgba(245, 245, 245, 1);
        }
    }
}


.qq-grop-code {
    position: fixed;
    bottom: 66px;
    right: 20px;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    z-index: 9999;

    .qr-code {
        width: 200px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;

        .code-image {
            width: 80%;
        }
    }
}
</style>
