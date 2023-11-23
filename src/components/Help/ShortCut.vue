<template>
    <div class="shortcut-keys">
        <div class="title">
            <div class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px', height: 2 + 'px' }"></div>
            <div class="item" :class="{ 'activate': itemid === index }" v-for="(title, index) in titles" :key="index"
                @click.stop="clickEvent(index, $event)">
                {{ getTypeText(title) }}
            </div>
            <CloseIcon @close="emits('close')"></CloseIcon>
        </div>
        <div class="shortcut-content">
            <div class="shortcut-item" v-for="(item, index) in selecttype(itemid)" :key="index">
                <div v-if="item.title" class="item-title">{{ item.title }}</div>
                <div class="item-name" v-for="(i, index) in item.shortcutKey" :key="index">
                    {{ i.name }}
                    <i class="item-key">{{ i.keys }}</i>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import CloseIcon from '../common/CloseIcon.vue';
import { selecttype, getTypeText, KeysType } from '@/context/shortcut'

const props = defineProps<{
    b: boolean
}>()
const emits = defineEmits<{
    (event: 'close'): void
}>()

const shortcut = ref<boolean>(false)
const titles = ref<any[]>(Object.values(KeysType).filter(value => typeof value === 'number'))
const itemid = ref(0)
const elwidth = ref()
const elleft = ref()

const clickEvent = (index: number, e: MouseEvent) => {
    itemid.value = index
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = (e.target as HTMLElement).offsetLeft
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
    shortcut.value = props.b
})
</script>
<style lang="scss" scoped>
.shortcut-keys {
    position: fixed;
    bottom: 56px;
    right: 20px;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    z-index: 9999;

    .title {
        display: flex;
        height: 32px;
        align-items: flex-end;
        padding: 0px 0px 0px 8px;
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

        .close {
            margin: 3px 6px 3px 0px;
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

            .item-title {
                color: var(--title-color);
                line-height: 20px;
                margin-bottom: 12px;
            }

            .item-name {
                color: #000000E6;
                line-height: 20px;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;

                .item-key {
                    color: #000000E6;
                }
            }
        }
    }
}
</style>
