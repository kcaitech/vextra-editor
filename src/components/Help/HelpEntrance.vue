<template>
    <div v-if="route.path.includes('/document') || route.path.includes('/apphome')" class="help-container">
        <div class="help-content" @click.stop="handleClickShowhelp">
            <svg-icon icon-class="help-icon"></svg-icon>
        </div>
        <Teleport to="body">
            <div v-if="showitem" class="help-item">
                <div v-for="(item, index) in items" :key="index" class="item" @click.stop="handleClickShow(index)">
                    <svg-icon :icon-class="itemsicon[index]" :style="{ marginTop: index === 0 ? '2px' : '' }"></svg-icon>
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
            <div v-if="shortcut" class="shortcut-keys">
                <div class="title">
                    <div class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px', height: 2 + 'px' }">
                    </div>
                    <div class="item" :class="{ 'activate': itemid === index }" v-for="(title, index) in titles"
                        :key="index" @click.stop="clickEvent(index, $event)">
                        {{ title }}
                    </div>
                </div>
                <div class="shortcut-content">
                    <div class="shortcut-item" v-for="(item, index) in shortcuts" :key="index">
                        <div class="item-title">{{ item.title }}</div>
                        <div class="item-name" style="display: flex;justify-content: space-between;"
                            v-for="(i, index) in item.shortcutKey" :key="index">
                            {{ i.name }}
                            <i class="item-key">{{ i.keys }}</i>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import QRCode from '@/assets/qr-code.png';
const route = useRoute()
const showitem = ref(false)
const qrcode = ref(false)
const shortcut = ref(false)
const items = ref<any[]>(['问题反馈', '快捷键介绍'])
const itemsicon = ref<any[]>(['feedback-icon', 'shortcut-icon'])
const titles = ref<any[]>(['工具', '视图', '缩放', '文本', '排列', '图层', '编辑', '形状', '组件'])
const elwidth = ref()
const elleft = ref()
const itemid = ref(0)
const shortcuts = ref<any[]>([{
    title: '',
    shortcutKey: [
        { name: '复制1', keys: 'Ctrl+C' },
        { name: '复制2', keys: 'Ctrl+C' }
    ]
},
{
    title: '',
    shortcutKey: [
        { name: '复制1', keys: 'Ctrl+C' },
        { name: '复制2', keys: 'Ctrl+C' }
    ]
},
{
    title: '',
    shortcutKey: [
        { name: '复制1', keys: 'Ctrl+C' },
        { name: '复制2', keys: 'Ctrl+C' }
    ]
}
])
const shortcuts1 = ref<any[]>([{ title: '测试标题2', shortcutKey: { name: '粘贴', keys: 'Ctrl+V' } }])

const shortcutdata = computed(() => {
    return itemid.value === 0 ? shortcuts : shortcuts1
})

const clickEvent = (index: number, e: MouseEvent) => {
    itemid.value = index
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = (e.target as HTMLElement).offsetLeft
}

const handleClickShowhelp = () => {
    if (qrcode.value) {
        qrcode.value = false
        return
    }
    if (shortcut.value) {
        shortcut.value = false
        return
    }
    showitem.value = !showitem.value
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
    if (shortcut.value) {
        if (!(e.target as HTMLElement).closest('.shortcut-keys')) {
            shortcut.value = false
        }
    }
}

const handleClickShow = (index: number) => {
    showitem.value = false
    if (index === 0) {
        qrcode.value = true
        shortcut.value = false
    } else {
        qrcode.value = false
        shortcut.value = true
    }
}

watch(shortcut, (newvalue) => {
    if (newvalue) {
        nextTick(() => {
            const items = document.querySelectorAll('.title .item')
            const rect = items[itemid.value].getBoundingClientRect()
            elwidth.value = rect.width
            const item = items[itemid.value] as HTMLElement
            if (item) {
                elleft.value = item.offsetLeft
            } else {
                return
            }
        })
    }
})

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);
})

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("contextmenu", handleClickOutside);
})

</script>
<style lang="scss" scoped>
.help-container {
    position: fixed;
    bottom: 16px;
    right: 20px;
    padding: 2px;
    z-index: 998;

    .help-content {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #9775fa;
        box-shadow: 1px 1px 3px #b1b1b1, -1px -1px 3px #b1b1b1;

        svg {
            width: 24px;
            height: 24px;
            color: white;
        }
    }
}

.help-item {
    position: fixed;
    bottom: 56px;
    right: 20px;
    font-size: 12px;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;

    .item {
        cursor: pointer;
        display: flex;
        align-items: center;
        line-height: 32px;
        padding: 0px 18px 0 12px;

        svg {
            width: 20px;
            height: 20px;
            margin-right: 6px;
        }

        &:hover {
            color: white;
            background: #9775fa;
        }
    }
}

.qq-grop-code,
.shortcut-keys {
    position: fixed;
    bottom: 56px;
    right: 20px;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;

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

    .title {
        display: flex;
        height: 32px;
        align-items: flex-end;
        padding: 0px 0 6px 32px;
        border-bottom: 1px solid #dddddd;

        .indicator {
            position: absolute;
            height: 2px;
            background-color: #9775fa;
            border-radius: 2px;
            transition: all 0.2s ease-in-out;
        }

        .item {
            cursor: pointer;
            white-space: nowrap;
            line-height: 32px;
            margin-right: 32px;
            font-size: 14px;
            font-weight: 600;
            color: #b1b1b1;
        }

        .activate {
            color: black;
            // border-bottom: 2px solid #9775fa;
        }
    }

    .shortcut-content {
        height: 300px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
        font-size: 12px;
        padding: 6px 16px 6px 16px;
        box-sizing: border-box;

        .shortcut-item {
            display: flex;
            flex-direction: column;
        }
        .item-title{
            color:var(--title-color)
        }

        .item-name{
            color: #000000E6;
            line-height: 20px;
            margin-bottom: 12px;
        }
    }
}
</style>
