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
                    <div class="item-key">{{ i.keys }}</div>
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
    width: 600px;
    bottom: 66px;
    right: 20px;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    z-index: 9999;

    .title {
        position: relative;
        display: flex;
        height: 40px;
        align-items: center;
        padding: 0px 0px 0px 8px;
        border-bottom: 1px solid rgba(245, 245, 245, 1);

        .indicator {
            position: absolute;
            height: 2px;
            top: 40px;
            background-color: #000000;
            border-radius: 292px;
            transition: all 0.2s ease-in-out;
        }

        .item {
            cursor: pointer;
            white-space: nowrap;
            font-size: 13px;
            font-weight: 500;
            color: rgba(89, 89, 89, 1);
            margin: 0 14px;
        }

        .close {
            position: absolute;
            right: 0;
            margin: 3px 6px 3px 0px;

            &:hover {
                background-color: rgba(247, 247, 249, 1);
            }

            &:active {
                background-color: rgba(243, 243, 245, 1);
            }
        }

        .activate {
            color: rgba(0, 0, 0, 1);
            font-weight: 600;
            // border-bottom: 2px solid #9775fa;
        }
    }

    .shortcut-content {
        height: 300px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 30px;
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
                font-size: 12px;
                font-weight: 600;
                color: rgba(89, 89, 89, 1);
                line-height: 40px;
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
