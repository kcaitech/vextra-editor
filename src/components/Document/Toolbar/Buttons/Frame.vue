<script setup lang="ts">
import {ref, nextTick} from 'vue';
import ToolButton from '../ToolButton.vue';
import {useI18n} from 'vue-i18n';
import FrameChild from './FrameChild.vue'
import {Action} from "@/context/tool";
import Tooltip from '@/components/common/Tooltip.vue';
import {Context} from '@/context';
import SvgIcon from "@/components/common/SvgIcon.vue";

type Button = InstanceType<typeof ToolButton>

const {t} = useI18n();
const props = defineProps<{
    context: Context,
    active: boolean
}>()
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
const visible = ref(false)

function select(action: Action) {
    emit('select', action);
}

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const frame = ref<HTMLDivElement>();
const hoverIndex = ref<number>(-1);

function showMenu(e: MouseEvent) {
    if (popoverVisible.value) return popoverVisible.value = false;
    emit('select', Action.AutoV);
    if (button.value?.toolButtonEl) {
        let el = button.value?.toolButtonEl;
        popoverVisible.value = true;
        nextTick(() => {
            if (popover.value) {
                popover.value.style.left = el.offsetLeft + 'px';
                popover.value.style.top = el.offsetHeight + 16 + 'px';
            }
        })
        document.addEventListener('click', onMenuBlur);
    }
}

function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover-f') && !e.target.closest('.menu-f')) {
        var timer = setTimeout(() => {
            popoverVisible.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onMenuBlur);
        }, 10)
    }

}

const left = ref(0)
const showChildFrame = (i: number) => {
    hoverIndex.value = i
    if (popover.value) {
        left.value = popover.value.offsetWidth
    }

}

const closeChildFrame = () => {
    hoverIndex.value = -1
}

const frames = ['frame.phone', 'frame.tablet', 'frame.deskdop', 'frame.presentation', 'frame.watch', 'frame.paper', 'frame.social_media']

const framesChild = [
    [['iPhone 14', '390 × 844'], ['iPhone 14 Pro', '393 × 852']],
    [['Surface Pro 8', '1440 × 960'], ['iPad mini 8.3', '744 × 1133']],
    [['MacBook Air', '1280 × 832'], ['Desktop', '1440 × 1024']],
    [['Slide 16:9', '1920 × 1080'], ['Slide 4:3', '1024 × 768']],
    [['Apple Watch 41mm', '176 × 215'], ['Apple Watch 45mm', '198 × 242']],
    [['A4', '595 × 842'], ['A5', '420 × 595']],
    [['Twitter post', '1200 × 675'], ['Twitter header', '1500 × 500']]
]

const closeFrame = () => {
    popoverVisible.value = false;
    hoverIndex.value = -1
}
const isSelect = () => {
    select(Action.AddFrame)
}
var timer: any = null
const onMouseenter = () => {
    timer = setTimeout(() => {
        visible.value = true
        clearTimeout(timer)
    }, 600)
}
const onMouseleave = () => {
    clearTimeout(timer)
    visible.value = false
}

const customFrame = () => {
    isSelect()
    popoverVisible.value = false;
}

</script>

<template>
    <div ref="popover" class="popover-f" tabindex="-1" v-if="popoverVisible">
        <div>
            <span @click="customFrame">{{ t('frame.custom') }}</span>
        </div>
        <div ref="frame" v-for="(item, i) in frames" :key="i" style="position: relative;">
            <div class="frame" @mouseenter="showChildFrame(i)" @mouseleave="closeChildFrame">
                <span>{{ t(`${item}`) }}</span>
<!--                <div class="triangle"></div>-->
                <svg-icon icon-class="arrowhead"></svg-icon>
                <FrameChild :context="props.context" :childFrame="hoverIndex === i" :top="-1" :left="left"
                            :framesChild="framesChild[i]" @closeFrame="closeFrame"></FrameChild>
            </div>
        </div>
    </div>
    <el-tooltip class="box-item" effect="dark"
                :content="`${t('shape.artboard')} &nbsp;&nbsp; F`" placement="bottom" :show-after="600" :offset="10"
                :hide-after="0" :visible="popoverVisible ? false : visible">
        <ToolButton ref="button" @click="isSelect" :selected="props.active" @mouseenter.stop="onMouseenter"
                    @mouseleave.stop="onMouseleave">
            <div class="svg-container">
                <svg-icon icon-class="frame"></svg-icon>
            </div>
            <div class="menu-f" @click="showMenu">
                <svg-icon icon-class="down"></svg-icon>
            </div>
        </ToolButton>
    </el-tooltip>
</template>

<style scoped lang="scss">
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 4px;
    color: #ffffff;
    padding: 6px 6px 6px 6px;
    box-sizing: border-box;

    > svg {
        width: 20px;
        height: 20px;
    }
}

.menu-f {
    width: 20px;
    height: 32px;
    display: flex;
    //padding-right: 4px;
    //margin-right: 2px;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    transition: 0.3s;
    padding: 10px 8px 10px 0;
    box-sizing: border-box;

    > svg {
        width: 12px;
        height: 12px;
    }
}

.menu-f:hover {
    transform: translateY(4px);
}

.popover-f {
    position: absolute;
    color: #ffffff;
    z-index: 999;
    width: 136px;
    height: auto;
    font-size: var(--font-default-fontsize);
    background-color: #262626;
    border-radius: 4px;
    outline: none;
    padding: 4px 0;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);

    > div {

        > span {
            padding: 9px 0 9px 28px;
            height: 32px;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;

            &:hover {
                background-color: #434343;
            }
        }

        .frame {
            position: relative;
            width: 100%;
            box-sizing: border-box;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 9px 0 9px 28px;

            &:hover {
                background-color: #434343;
            }

            //.triangle {
            //    width: 0;
            //    height: 0;
            //    padding: 0;
            //    border-top: 5px solid transparent;
            //    border-bottom: 5px solid transparent;
            //    border-left: 10px solid var(--theme-color-anti);
            //}
            >svg {
                height: 16px;
                width: 16px;
                margin-right: 8px;
                margin-left: 60px;
                margin-top: 4px;
            }
        }

    }
}

// @keyframes bounce {
//   0% {
//     transform: translateY(0);
//   }
//   50% {
//     transform: translateY(6px);
//   }
//   100% {
//     transform: translateY(0);
//   }
// }
// .button:hover {
//   .menu > svg {
//     animation-duration: .5s;
//     animation-name: bounce;
//   }
// }
</style>