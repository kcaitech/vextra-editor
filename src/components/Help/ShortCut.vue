<template>
    <div class="shortcut-keys">
        <div class="title">
            <div class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px', height: 2 + 'px' }"></div>
            <div class="item" :class="{ 'activate': itemid === index }" v-for="(title, index) in titles" :key="index"
                @click.stop="clickEvent(index, $event)">
                {{ getTypeText(title) }}
            </div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="shortcut-content">
            <div class="shortcut-item" v-for="(item, index) in selecttype(itemid)" :key="index">
                <div v-if="item.title" class="item-title">{{ item.title }}</div>
                <div class="item-name" v-for="(i, index) in item.shortcutKey" :key="index">
                    {{ i.name }}
                    <div class="item-key">
                        <span :style="{ color: (key === '+' && index !== 0) ? '#BFBFBF' : '' }"
                            v-for="(key, index) in strArray(string_by_sys(i.keys))" :key="key">
                            {{ key === "+" ? ` ${key} ` : key }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { selecttype, getTypeText, KeysType } from '@/context/shortcut'
import { string_by_sys } from '@/utils/common'

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

const strArray = (str: any) => {
    return str.split(' ')
}

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
    width: 700px;
    bottom: 66px;
    right: 20px;
    border-radius: 8px;
    background-color: white;
    border: 1px solid #EBEBEB;
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
            white-space: nowrap;
            font-size: 13px;
            font-weight: 500;
            color: rgba(89, 89, 89, 1);
            margin: 0 14px;
            position: relative;

            &::after {
                content: "";
                position: absolute;
                left: -14px;
                right: -14px;
                top: -14px;
                bottom: -14px;
            }
        }

        .close {
            display: flex;
            position: absolute;
            right: 0;
            margin: 3px 6px 3px 0px;
            width: 16px;
            height: 16px;
            padding: 4px;
            border-radius: 6px;

            &:hover {
                background-color: rgb(243, 243, 245);
                cursor: pointer;
            }

            svg {
                width: 100%;
                height: 100%;
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
                color: #595959;
                line-height: 40px;
                display: flex;
                justify-content: space-between;
                gap: 12px;

                .item-key {
                    color: #434343;
                }
            }
        }
    }
}
</style>
