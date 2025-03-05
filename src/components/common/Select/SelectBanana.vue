<script lang="ts" setup>
import { Context } from "@/context";
import down_icon from "@/assets/icons/svg/down.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { v4 } from "uuid";

const props = defineProps<{
    context: Context;
    options: { label: string; value: any } [];
    value: any;
}>();
const emits = defineEmits<{
    (e: "change", value: any): void;
}>();

const label = computed(() => props.options.find(i => i.value === props.value)?.label ?? '');

function change(val: any) {
    if (val !== props.value) emits("change", val);
    popoverVisible.value = false;
}

const popoverVisible = ref<boolean>(false);
const popoverEl = ref<HTMLDivElement>();

const downCheck = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.select-banana-wrapper, .popover-select-banana')) popoverVisible.value = false;
}

function show() {
    (popoverVisible.value = !popoverVisible.value) && nextTick(locate);
}

function locate() {
    let left: number = 0;
    let top: number = -6;

    const index = props.options.findIndex(i => props.value === i.value);
    index > -1 ? top -= index * 32 : top = 34;

    const el = popoverEl.value!;
    el.style.top = top + 'px';
    el.style.left = left + 'px';

    props.context.escstack.save(v4(), () => {
        const achieve = popoverVisible.value;
        popoverVisible.value = false;
        return achieve;
    });
}

onUnmounted(watch(() => popoverVisible.value, val => {
    if (val) {
        document.addEventListener('mousedown', downCheck);
    } else {
        document.removeEventListener('mousedown', downCheck);
    }
}));
</script>
<template>
    <div class="select-banana-wrapper" @click.stop="show">
        <span class="info">{{ label }}</span>
        <div class="icon">
            <SvgIcon :icon="down_icon"/>
        </div>
        <div v-if="popoverVisible" ref="popoverEl" class="popover-select-banana">
            <div v-for="(op, idx) in options" class="item" :key="idx"
                 @click.stop="() => change(op.value)">
                <span>{{ op.label }}</span>
                <svg width="9" height="6" viewBox="0 0 15 10" :class="op.value === value ? 'check':'un-check'">
                    <path d="M14.7559,0.244078C15.0813,0.569514,15.0813,1.09715,14.7559,1.42259C14.7559,1.42259,5.58926,10.5893,5.58926,10.5893C5.26382,10.9147,4.73618,10.9147,4.41074,10.5893C4.41074,10.5893,0.244077,6.42259,0.244077,6.42259C-0.0813592,6.09715,-0.0813592,5.56952,0.244077,5.24408C0.569514,4.91864,1.09715,4.91864,1.42259,5.24408C1.42259,5.24408,5,8.8215,5,8.8215C5,8.8215,13.5774,0.244078,13.5774,0.244078C13.9028,-0.0813593,14.4305,-0.0813593,14.7559,0.244078C14.7559,0.244078,14.7559,0.244078,14.7559,0.244078Z" fill-rule="evenodd" fill="inherit"/>
                </svg>
            </div>

        </div>
    </div>
</template>
<style lang="scss" scoped>
.select-banana-wrapper {
    width: 100%;
    height: 32px;
    border-radius: var(--default-radius);
    background-color: var(--input-background);
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 8px;
    box-sizing: border-box;

    .info {
        flex: 1;
        width: 50px;
        font-size: var(--font-default-fontsize);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .icon {
        flex: 0 0 24px;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: -2px;

        > svg {
            width: 12px;
            height: 12px;
        }
    }

    .popover-select-banana {
        position: absolute;
        width: 100%;
        height: fit-content;
        padding: 6px 0;
        background-color: #FFFFFF;
        left: 0;
        top: -6px;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        z-index: 1;
        overflow: hidden;
        border-radius: var(--default-radius);

        .item {
            width: 100%;
            height: 32px;
            padding: 0 8px;
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: flex;
            align-items: center;

            .span {
                display: inline-block;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            svg {
                position: absolute;
                right: 12px;
                fill: var(--theme-color);
            }

            .check {
                visibility: visible;
                pointer-events: auto;
            }

            .un-check {
                visibility: hidden;
                pointer-events: none;
            }

            &:hover {
                color: var(--theme-color-anti);
                background-color: var(--active-color);

                svg {
                    position: absolute;
                    right: 12px;
                    fill: var(--theme-color-anti);
                }
            }
        }
    }

    &:hover {
        .icon {
            background-color: #e5e5e5;
        }
    }
}
</style>