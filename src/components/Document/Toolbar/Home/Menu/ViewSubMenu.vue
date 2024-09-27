<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { adapt_page } from '@/utils/content';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
    x: number,
    y: number,
    context: Context,
    width?: number,
    site?: { x: number, y: number }
    fixed?: boolean
}

const props = defineProps<Props>();
const { t } = useI18n();
const emit = defineEmits<{
    (e: 'close'): void;
}>();
const surplusX = ref<number>(0);
const subMenu = ref<HTMLDivElement>();
const isCursor = ref<boolean>(props.context.menu.isUserCursorVisible);
const isPixel = ref<boolean>(props.context.user.isPixelAlignMent);
const isGrid = ref<boolean>(props.context.user.isPixelGrid);
const isRule = ref<boolean>(props.context.user.isRuleVisible);

const items = ref<string[]>(['half', 'hundred', 'double', 'canvas', 'cursor', 'comment', 'grid', 'pixel', 'rule']);

/**
 * 50%视图
 */
function half(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 0.5);
    emit('close');
}

/**
 * 全比例视图
 */
function hundred(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 1);
    emit('close');
}

/**
 * 两倍视图
 */
function double(e: MouseEvent) {
    e.preventDefault();
    page_scale(e, 2);
    emit('close');
}

/**
 * 页面缩放
 * @param scale 缩放倍数 > 0
 */
function page_scale(e: MouseEvent, scale: number) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const matrix = workspace.matrix;
    const offsetX = e.x - root.x;
    const offsetY = e.y - root.y;
    matrix.trans(-offsetX, -offsetY);
    matrix.scale(scale / matrix.m00);
    matrix.trans(offsetX, offsetY);
    workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

/**
 * 使整个page在可视区域
 */
function canvas() {
    adapt_page(props.context);
    emit('close');
}

function cursor() {
    const status = props.context.menu.isUserCursorVisible;
    isCursor.value = !status;
    props.context.menu.setVisibleCursor(isCursor.value);
    emit('close');
}

// function comment() {
//     const status = props.context.comment.isVisibleComment;
//     isComment.value = !status;
//     props.context.comment.setVisibleComment(isComment.value);
//     emit('close');
// }

function modifyPixelAlgin() {
    const status = props.context.user.isPixelAlignMent;
    props.context.user.modifyPixelAlignment(!status);
    emit('close');
}

function modifyRuleVisible() {
    const status = props.context.user.isRuleVisible;
    props.context.user.modifyRuleVisible(!status);
    emit('close');
}


function modifyPixelGrid() {
    const status = props.context.user.isPixelGrid;
    props.context.user.modifyPixelGrid(!status);
    emit('close');
}

onMounted(() => {
    if (props.site) {
        surplusX.value = document.documentElement.clientWidth - props.site.x
    }
})
</script>
<template>
    <div ref="subMenu" v-bind="$attrs" :style="{ position: fixed ? 'fixed' : 'absolute', top: props.y + 'px', left: props.x + 'px' }" class="subMenu"
        @mousemove.stop>
        <div class="item" v-if="items.includes('half')" @click="(e: MouseEvent) => half(e)">
            <span>50%</span>
        </div>
        <div class="item" v-if="items.includes('hundred')" @click="(e: MouseEvent) => hundred(e)">
            <span>100%</span>
        </div>
        <div class="item" v-if="items.includes('double')" @click="(e: MouseEvent) => double(e)">
            <span>200%</span>
        </div>
        <div class="item" v-if="items.includes('canvas')" @click="canvas">
            <span>{{ t('system.fit_canvas') }}</span>
        </div>
        <div class="line" v-if="items.includes('cursor')"></div>
        <div class="item" v-if="items.includes('cursor')" @click="cursor">
            <div class="choose">
                <svg-icon icon-class="white-select" v-show="isCursor"></svg-icon>
            </div>
            <span :style="{ marginLeft: isCursor ? '8px' : '20px' }">{{ t('system.show_many_cursor') }}</span>
        </div>
        <!-- <div class="item" v-if="items.includes('comment')" @click="comment">
            <div class="choose">
                <svg-icon icon-class="white-select" v-show="isComment"></svg-icon>
            </div>
            <span :style="{ marginLeft: isComment ? '8px' : '20px' }">{{ t('system.show_comment') }}</span>
        </div> -->
        <div class="item" v-if="items.includes('grid')" @click="modifyPixelGrid">
            <div class="choose">
                <svg-icon icon-class="white-select" v-show="isGrid"></svg-icon>
            </div>
            <span :style="{ marginLeft: isGrid ? '8px' : '20px' }">{{ t('system.grid') }}</span>
        </div>
        <div class="item" v-if="items.includes('pixel')" @click="modifyPixelAlgin">
            <div class="choose">
                <svg-icon icon-class="white-select" v-show="isPixel"></svg-icon>
            </div>
            <span :style="{ marginLeft: isPixel ? '8px' : '20px' }">{{ t('system.pixel') }}</span>
        </div>
        <div class="item" v-if="items.includes('rule')" @click="modifyRuleVisible">
            <div class="choose">
                <svg-icon icon-class="white-select" v-show="isRule"></svg-icon>
            </div>
            <span :style="{ marginLeft: isRule ? '8px' : '20px' }">{{ t('system.rule') }}</span>
        </div>
    </div>
    <div class="bottom"></div>
</template>
<style scoped lang="scss">
.subMenu {
    position: absolute;
    z-index: 999;
    left: 136px;
    top: -2px;
    color: var(--theme-color-anti);
    font-size: 12px;
    width: 158px;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.08);
    background-color: #262626;
    overflow: hidden;
    padding: 6px 0;
    border-left: 2px solid;
    box-sizing: border-box;


    .line {
        width: 100%;
        border-bottom: 1px solid #434343;
        margin-top: 4px;
        margin-bottom: 4px;
        box-sizing: border-box;
    }

    .item {
        position: relative;
        width: 100%;
        height: 32px;
        padding: 9px 0 9px 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;

        >span {
            margin-left: 20px;
        }

        //.choose {
        //  position: absolute;
        //  left: 7px;
        //  box-sizing: border-box;
        //  width: 10px;
        //  height: 6px;
        //  border-width: 0 0 2px 2px;
        //  border-style: solid;
        //  border-color: var(--theme-color-anti);
        //  transform: rotate(-45deg) translateY(-4%);
        //}
        .choose {
            width: 12px;
            height: 12px;
            display: contents;

            svg {
                width: 12px;
                height: 12px;
            }
        }
    }

    .item:hover {
        background-color: var(--active-color);
    }
}
</style>