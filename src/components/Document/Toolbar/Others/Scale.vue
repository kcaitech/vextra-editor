<script setup lang='ts'>
import { Context } from '@/context';
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { page_scale } from '@/utils/content';
import { WorkSpace } from '@/context/workspace';
import { XY } from '@/context/selection';
import ViewSubMenu from '../Home/Menu/ViewSubMenu.vue';
interface Props {
    context: Context,
    params: any
}
const props = defineProps<Props>();
const cus = ref<boolean>(false);
const input = ref<HTMLInputElement>();
const inputSpan = ref<HTMLSpanElement>()
const inputSpan2 = ref<HTMLSpanElement>()
const childMenuPosition: XY = reactive({ x: 0, y: 0 });
const inputWidth = ref(32)
const childMenuVisible = ref<boolean>(false);
let scale = ref<string>('100');
function input_cus(e: MouseEvent) {
    const rect = (e.target as Element).getBoundingClientRect()
    const left = window.innerWidth - (rect.left + 158)
    childMenuPosition.x = left > 0 ? rect.left : rect.left + left - 8
    childMenuPosition.y = 48
    childMenuVisible.value = true
    cus.value = !cus.value;
    nextTick(() => {
        if (input.value) {
            if (inputSpan2.value) {
                inputSpan2.value.innerHTML = scale.value
                inputWidth.value = inputSpan2.value.offsetWidth
            }
            input.value.value = scale.value;
            input.value.select();
            input.value.addEventListener('blur', blur);
            document.addEventListener('keydown', enter)
        }
    })
    document.addEventListener('click', onMenuBlur)
}

function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.show-sub-menu, .right')) childMenuVisible.value = false;
}

function enter(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (input.value) {
            page_scale(props.context, (Number(input.value.value) || props.context.workspace.matrix.m00 * 100) / 100);
        }
        cus.value = false;
    }
}
function blur() {
    if (input.value) {
        page_scale(props.context, (Number(input.value.value) || props.context.workspace.matrix.m00 * 100) / 100);
    }
    cus.value = false;
}
function init() {
    scale.value = (props.context.workspace.matrix.toArray()[0] * 100).toFixed(0) + '%';
    if (inputSpan.value) {
        inputWidth.value = inputSpan.value.offsetWidth
    }
}
function watcher(t: any) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        scale.value = (props.context.workspace.matrix.toArray()[0] * 100).toFixed(0) + '%';
    }
}

const onInputName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    if (inputSpan2.value) {
        inputSpan2.value.innerHTML = value
        inputWidth.value = inputSpan2.value.offsetWidth
    }
}

function close() {
    childMenuVisible.value = false;
}

const setScale = (e: Event) => {
    page_scale(props.context, (Number(scale.value) || props.context.workspace.matrix.m00 * 100) / 100);
    if (!scale.value.includes('%')) {
        scale.value = scale.value + '%';
    }

    (e.target as HTMLInputElement).blur()
}

const showMenu = (e: MouseEvent) => {
    const rect = (e.target as Element).getBoundingClientRect()
    const left = window.innerWidth - (rect.left + 158)
    childMenuPosition.x = left > 0 ? rect.left : rect.left + left - 8
    childMenuPosition.y = 48
    childMenuVisible.value = !childMenuVisible.value

}
const stop = watch(() => childMenuVisible.value, (v) => {
    if (v) {
        document.addEventListener('click', onMenuBlur)
        props.context.escstack.save('scale-menu', () => {
            const achieve = childMenuVisible.value;
            childMenuVisible.value = false;
            return achieve;
        })
    } else {
        document.removeEventListener('click', onMenuBlur);
    }
})
onMounted(() => {
    props.context.workspace.watch(watcher);
    init();
})
onUnmounted(() => {
    props.context.workspace.watch(watcher);
    stop();
})
</script>
<template>
    <div class="scale-display-warp">
        <div class="left">
            <input v-select type="text" v-model="scale" @change="(e: Event) => setScale(e)" @keydown="enter">
        </div>
        <div class="right" :class="{ 'arrow-active': childMenuVisible }" @click="showMenu">
            <svg-icon icon-class="white-down"/>
        </div>
        <ViewSubMenu class="show-sub-menu" v-if="childMenuVisible" :context="props.context" :fixed="true"
            :x="childMenuPosition.x" :y="childMenuPosition.y" :width="180" @close="close">
        </ViewSubMenu>
    </div>
</template>
<style lang='scss' scoped>
.arrow-active {
    background-color: rgba(255, 255, 255, 0.1);

    svg {
        transform: translateY(2px)
    }
}

.scale-display-warp {
    min-width: 32px;
    width: 72px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--default-radius);
    padding:0;
    box-sizing: border-box;

    .left {
        flex: 0.7;
        width: 100%;
        height: 100%;

        input {
            width: 100%;
            height: 100%;
            font-size: 13px;
            background-color: transparent;
            outline: none;
            border: none;
            color: var(--theme-color-anti);
            padding: 0;
            text-align: center;
            font-feature-settings: "kern" on;
        }
    }

    .right {
        flex: 0.3;
        width: 100%;
        height: 100%;
        display: flex;
        border-radius: 0 6px 6px 0;

        &:hover {
            background-color: rgba(255, 255, 255, 0.1);

            svg {
                transform: translateY(2px)
            }
        }

        svg {
            width: 12px;
            height: 12px;
            margin: auto;
            transition: all .2s;
        }

    }


}
</style>