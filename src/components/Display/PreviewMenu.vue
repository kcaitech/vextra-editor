<script setup lang="ts">
import { Context } from '@/context';
import { Preview, ScaleType } from '@/context/preview';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import Key from '../common/Key.vue';
import { getFrameList } from '@/utils/preview';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
interface Props {
    context: Context
    top: number
    left: number
    isDown?: boolean
}
const emit = defineEmits<{
    (e: 'close'): void;
}>();
const props = defineProps<Props>();
const scaleType = ref<ScaleType>();
const previewMenu = ref<HTMLDivElement>();
const showUi = ref(props.context.preview.uiState);
const close = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.target instanceof Element && !e.target.closest('.preview_menu')) {
        emit('close');
    }
}

const keyClose = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.code === 'Escape') {
        emit('close');
    }
}

const changeScale = (type: ScaleType) => {
    props.context.preview.setScaleMenu(type);
    emit('close');
}

const updateScaleType = () => {
    const type = props.context.preview.scaleType;
    scaleType.value = type;
}

const hiddenUi = () => {
    props.context.preview.showUiVisible(!props.context.preview.uiState);
    emit('close');
}

const previewWatcher = (t: number) => {
    if (t === Preview.MENU_CHANGE) {
        updateScaleType();
    } else if (t === Preview.MENU_VISIBLE) {
        emit('close');
    } else if (t === Preview.UI_CHANGE) {
        showUi.value = props.context.preview.uiState;
    }
}

const setPosition = () => {
    nextTick(() => {
        if (!previewMenu.value) return;
        const body = document.body.getBoundingClientRect();
        const menu = previewMenu.value.getBoundingClientRect();
        const maxTop = body.height - menu.height;
        const maxLeft = body.width - menu.width;
        previewMenu.value.style.top = Math.min(props.top, maxTop) + 'px';
        if (props.isDown) {
            previewMenu.value.style.right = '5px';
        } else {
            previewMenu.value.style.left = Math.min(props.left, maxLeft) + 'px';
        }
    })
}

const togglePage = (p: number) => {
    const shape = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    if (!shape || !page) return;
    const naviList = props.context.preview.naviShapeList;
    const frameList = naviList.length > 0 ? naviList : getFrameList(page);
    let index = frameList.findIndex(item => item.id === shape.id);
    if (index === -1) return;
    index += p;
    if (index < 0 || index > (frameList.length - 1)) return;
    props.context.selection.selectShape(frameList[index]);
    props.context.preview.setFromShapeAction(undefined);
}
const firstPage = () => {
    const shape = props.context.selection.selectedShapes[0];
    const page = props.context.selection.selectedPage;
    if (!shape || !page) return emit('close');
    const naviList = props.context.preview.naviShapeList;
    const frameList = naviList.length > 0 ? naviList : getFrameList(page);
    let index = frameList.findIndex(item => item.id === shape.id);
    if (index === -1) return emit('close');
    props.context.selection.selectShape(frameList[0]);
    props.context.preview.setFromShapeAction(undefined);
    emit('close');
}

const isHotZone = ref(true);
const hotZone = () => {
    const isHot = localStorage.getItem('proto_hot_zone') ?? 'true';
    if (isHot === 'true') {
        isHotZone.value = true;
    } else {
        isHotZone.value = false;
    }
}

const hiddenHotZone = () => {
    const isHot = localStorage.getItem('proto_hot_zone') ?? 'true';
    if (isHot === 'true') {
        localStorage.setItem('proto_hot_zone', 'false');
        isHotZone.value = false;
    } else {
        localStorage.setItem('proto_hot_zone', 'true');
        isHotZone.value = true;
    }
    emit('close');
}

onMounted(() => {
    hotZone();
    props.context.preview.setMenuVisible(true);
    updateScaleType();
    setPosition();
    props.context.preview.watch(previewWatcher);
    document.addEventListener('click', close);
    document.addEventListener('keydown', keyClose);
})
onUnmounted(() => {
    props.context.preview.watch(previewWatcher);
    props.context.preview.setMenuVisible(false);
    document.removeEventListener('click', close);
    document.removeEventListener('keydown', keyClose);
})
</script>

<template>
    <div class="preview_menu" ref="previewMenu" @mousedown.stop>
        <div class="item" @click.stop="changeScale(ScaleType.Actual)">
            <div class="choose">
                <svg-icon v-if="scaleType === ScaleType.Actual || scaleType === undefined"
                    icon-class="choose"></svg-icon>
            </div>
            <div class="text">{{ t('preview.actual_size') }}（100%）</div>
            <div class="key" style="padding-right: 3px;">
                <Key code="Ctrl 0"></Key>
            </div>
        </div>
        <div class="item" @click.stop="changeScale(ScaleType.FitScreen)">
            <div class="choose">
                <svg-icon v-if="scaleType === ScaleType.FitScreen" icon-class="choose"></svg-icon>
            </div>
            <div class="text">{{ t('preview.fit_screen') }}</div>
            <div class="key"><span class="span">Z</span></div>
        </div>
        <div class="item" @click.stop="changeScale(ScaleType.FillScreen)">
            <div class="choose">
                <svg-icon v-if="scaleType === ScaleType.FillScreen" icon-class="choose"></svg-icon>
            </div>
            <div class="text">{{ t('preview.fill_screen') }}</div>
            <div class="key"><span class="span">Z</span></div>
        </div>
        <div class="item" @click.stop="changeScale(ScaleType.FitWidth)">
            <div class="choose">
                <svg-icon v-if="scaleType === ScaleType.FitWidth" icon-class="choose"></svg-icon>
            </div>
            <div class="text">{{ t('preview.fit_width') }}</div>
            <div class="key"><span class="span">Z</span></div>
        </div>
        <div class="line"></div>
        <div class="item" @click.stop="togglePage(-1)">
            <div class="choose"></div>
            <div class="text">{{ t('preview.previous_page') }}</div>
            <div class="key" style="font-size: 20px;"><svg-icon
                    icon-class="arrow-right"></svg-icon></div>
        </div>
        <div class="item" @click.stop="togglePage(1)">
            <div class="choose"></div>
            <div class="text">{{ t('preview.next_page') }}</div>
            <div class="key" style="font-size: 20px; transform: rotate(180deg);"><svg-icon icon-class="arrow-right"></svg-icon></div>
        </div>
        <div class="item" @click.stop="firstPage">
            <div class="choose"></div>
            <div class="text">{{ t('preview.first_page') }}</div>
            <div class="key"></div>
        </div>
        <div class="line"></div>
        <div class="item" @click.stop="hiddenHotZone">
            <div class="choose">
                <svg-icon v-if="isHotZone" icon-class="choose"></svg-icon>
            </div>
            <div class="text">{{ t('preview.hot_zone') }}</div>
            <div class="key"></div>
        </div>
        <div class="item" @click.stop="hiddenUi">
            <div class="choose">
                <svg-icon v-if="!showUi" icon-class="choose"></svg-icon>
            </div>
            <div class="text">{{ t('system.hide_operation_interface') }}</div>
            <div class="key" style="padding-right: 3px;">
                <Key code="Ctrl \"></Key>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.preview_menu {
    position: fixed;
    z-index: 999;
    color: #262626;
    border-radius: 8px;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
    background-color: #FFFFFF;
    padding: 6px 0;
    box-sizing: border-box;
    min-width: auto;
    font-size: 12px;

    .item {
        height: 32px;
        display: flex;
        align-items: center;
        padding-right: 24px;
        box-sizing: border-box;
        max-width: 100%;

        &:hover {
            background-color: #1878F5;
            color: #fff;

            svg {
                fill: #ffffff !important;
            }
        }

        .choose {
            height: 100%;
            width: 32px;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
                fill: #262626;
                width: 12px;
                height: 12px;
            }
        }

        .text {
            margin-right: 30px;
            flex: 1;
        }

        .key {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .span {
                display: flex;
                width: 12px;
                height: 100%;
                align-items: center;
                justify-content: center;
            }

            svg {
                fill: #262626;
                width: 12px;
                height: 12px;
            }
        }
    }

    .line {
        width: 100%;
        height: 4px;
        border-bottom: 1px solid #EBEBEB;
        margin-bottom: 4px;
        box-sizing: border-box;
    }
}
</style>