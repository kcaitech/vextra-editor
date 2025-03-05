<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { Menu } from "@/context/menu";
import Tooltip from '@/components/common/Tooltip.vue';


interface Props {
    autoLayoutDate: AutolayoutCtx
    context: Context
}

const props = defineProps<Props>();
const { t } = useI18n();
const popover = ref();
const hoverBorderItem = ref(props.autoLayoutDate.bordersTakeSpace || false);
const hoverStackItem = ref(props.autoLayoutDate.stackReverseZIndex || false);
const borderSelect = ref(false);
const stackSelect = ref(false);

function showMenu() {
    props.context.menu.notify(Menu.SHUTDOWN_MENU);
    popover.value.show();
}

const openBorderTakeMenu = () => {
    stackSelect.value = false;
    borderSelect.value = true;
    hoverStackItem.value = props.autoLayoutDate.stackReverseZIndex || false;
    document.addEventListener('click', handleClick);
}

const openStackMenu = () => {
    borderSelect.value = false;
    stackSelect.value = true;
    hoverBorderItem.value = props.autoLayoutDate.bordersTakeSpace || false;
    document.addEventListener('click', handleClick);
}

const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.auto-setting-options') && close();
}

const close = () => {
    stackSelect.value = false;
    borderSelect.value = false;
    hoverBorderItem.value = props.autoLayoutDate.bordersTakeSpace || false;
    hoverStackItem.value = props.autoLayoutDate.stackReverseZIndex || false;
    document.removeEventListener('click', handleClick);
}

const changeBorderItem = (included: boolean) => {
    if (props.autoLayoutDate.bordersTakeSpace === included) return close();
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.modifyAutoLayoutStroke(shapes, included);
    close();
}

const changeStackZIndexItem = (stack: boolean) => {
    if (props.autoLayoutDate.stackReverseZIndex === stack) return close();
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.modifyAutoLayoutZIndex(shapes, stack);
    close();
}

const selectedTop = (item?: string | boolean) => {
    if (typeof item === 'string') {
        return '-4px';
    }
    if (item) {
        return '-4px';
    } else {
        return '-36px'
    }
}

const bordersTakeValue = (v?: string | boolean) => {
    if (typeof v === 'string') return t('attr.mixed');
    return v ? t('autolayout.included') : t('autolayout.excluded')
}

const stackReverseValue = (v?: string | boolean) => {
    if (typeof v === 'string') return t('attr.mixed');
    return v ? t('autolayout.stack') : t('autolayout.reverse_stack')
}
onMounted(() => {
})
onUnmounted(() => {
})

import SvgIcon from '@/components/common/SvgIcon.vue';
import down_icon from "@/assets/icons/svg/down.svg";
import white_select_icon from "@/assets/icons/svg/white-select.svg";
import page_select_icon from "@/assets/icons/svg/page-select.svg";
import select_more_icon from "@/assets/icons/svg/select-more.svg";
import included_strokes_icon from "@/assets/icons/svg/included-strokes.svg";
import excluded_strokes_icon from "@/assets/icons/svg/excluded-strokes.svg";
import reverse_stack_icon from "@/assets/icons/svg/reverse-stack.svg";
import pile_up_icon from "@/assets/icons/svg/pile-up.svg";
import { AutolayoutCtx } from './ctx';
</script>

<template>
    <div class="auto-layout-detail-container" @mousedown.stop>
        <Popover :context="props.context" class="popover" ref="popover" :width="250" :auto_to_right_line="true"
            :title="t('autolayout.auto_layout_settings')">
            <template #trigger>
                <Tooltip :content="t(`autolayout.settings`)">
                    <div class="trigger">
                        <div class="bg" @click="showMenu">
                            <SvgIcon :icon="select_more_icon" />
                        </div>
                    </div>
                </Tooltip>
            </template>
            <template #body>
                <div class="options-container">
                    <div class="selected">
                        <div class="title">{{ t('autolayout.stroke') }}</div>
                        <div class="auto-setting-options" @click.stop="openBorderTakeMenu">
                            <span>{{ bordersTakeValue(autoLayoutDate.bordersTakeSpace) }}</span>
                            <div class="icon">
                                <SvgIcon :icon="down_icon" />
                            </div>
                            <div class="select_menu" v-if="borderSelect"
                                :style="{ top: selectedTop(autoLayoutDate.bordersTakeSpace) }">
                                <div v-if="typeof autoLayoutDate.bordersTakeSpace === 'string'" class="item disabled">
                                    <div class="icon">
                                        <SvgIcon :icon="page_select_icon" />
                                    </div>
                                    <div class="text">{{ t('attr.mixed') }}</div>
                                </div>
                                <div class="item" :class="{ 'active-item': hoverBorderItem }"
                                    @click.stop="changeBorderItem(true)" @mouseenter="hoverBorderItem = true">
                                    <div class="icon">
                                        <SvgIcon v-if="autoLayoutDate.bordersTakeSpace === true"
                                            :icon="hoverBorderItem ? white_select_icon : page_select_icon" />
                                    </div>
                                    <div class="text">{{ t('autolayout.included') }}</div>
                                </div>
                                <div class="item" :class="{ 'active-item': !hoverBorderItem }"
                                    @click.stop="changeBorderItem(false)" @mouseenter="hoverBorderItem = false">
                                    <div class="icon">
                                        <SvgIcon v-if="!autoLayoutDate.bordersTakeSpace"
                                            :icon="!hoverBorderItem ? white_select_icon : page_select_icon" />
                                    </div>
                                    <div class="text">{{ t('autolayout.excluded') }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="preview">
                        <div style="width: 120px;">
                            <SvgIcon :icon="hoverBorderItem ? included_strokes_icon : excluded_strokes_icon" />
                        </div>
                    </div>
                    <div class="selected">
                        <div class="title">{{ t('autolayout.canvas_stack') }}</div>
                        <div class="auto-setting-options" @click.stop="openStackMenu">
                            <span> {{ stackReverseValue(autoLayoutDate.stackReverseZIndex) }}</span>
                            <div class="icon">
                                <SvgIcon :icon="down_icon" />
                            </div>
                            <div class="select_menu" v-if="stackSelect"
                                :style="{ top: selectedTop(autoLayoutDate.bordersTakeSpace) }">
                                <div v-if="typeof autoLayoutDate.stackReverseZIndex === 'string'" class="item disabled">
                                    <div class="icon">
                                        <SvgIcon :icon="page_select_icon" />
                                    </div>
                                    <div class="text">{{ t('attr.mixed') }}</div>
                                </div>
                                <div class="item" :class="{ 'active-item': hoverStackItem }"
                                    @click.stop="changeStackZIndexItem(true)" @mouseenter="hoverStackItem = true">
                                    <div class="icon">
                                        <SvgIcon v-if="autoLayoutDate.stackReverseZIndex === true"
                                            :icon="hoverStackItem ? white_select_icon : page_select_icon" />
                                    </div>
                                    <div class="text">{{ t('autolayout.stack') }}</div>
                                </div>
                                <div class="item" :class="{ 'active-item': !hoverStackItem }"
                                    @click.stop="changeStackZIndexItem(false)" @mouseenter="hoverStackItem = false">
                                    <div class="icon">
                                        <SvgIcon v-if="!autoLayoutDate.stackReverseZIndex"
                                            :icon="!hoverStackItem ? white_select_icon : page_select_icon" />
                                    </div>
                                    <div class="text">{{ t('autolayout.reverse_stack') }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="preview">
                        <div>
                            <SvgIcon :icon="!hoverStackItem ? reverse_stack_icon : pile_up_icon" />
                        </div>
                    </div>
                </div>
            </template>
        </Popover>
    </div>
</template>

<style scoped lang="scss">
.actived {
    background-color: #EBEBEB;
}

.auto-layout-detail-container {
    >.popover {
        width: 28px;
        height: 32px;

        .trigger {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;

            .bg {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);

                >svg {
                    width: 16px;
                    height: 16px;
                }
            }

            .bg:hover {
                background-color: #F5F5F5;
            }
        }

        .options-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 12px 12px 4px 12px;
            box-sizing: border-box;
            height: 100%;


            .selected {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 32px;
                margin-bottom: 8px;

                .auto-setting-options {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-left: 10px;
                    width: 138px;
                    height: 100%;
                    border-radius: 6px;
                    background-color: #F5F5F5;
                    box-sizing: border-box;

                    .icon {
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        svg {
                            width: 14px;
                            height: 14px;
                        }
                    }

                    .select_menu {
                        position: absolute;
                        left: 0px;
                        width: 100%;
                        border-radius: 4px;
                        background-color: #fff;
                        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
                        z-index: 100;
                        padding: 4px 0;

                        .item {
                            box-sizing: border-box;
                            display: flex;
                            align-items: center;
                            width: 100%;
                            height: 32px;

                            .icon {
                                width: 32px;
                                height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;

                                >svg {
                                    width: 12px;
                                    height: 12px;
                                }
                            }
                        }
                    }

                    &:hover {
                        background-color: #EBEBEB;
                    }
                }
            }

            .preview {
                width: 100%;
                height: 100px;
                border-radius: 6px;
                background-color: #F5F5F5;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;

                div {
                    width: 102px;
                    height: 41px;

                    svg {
                        width: 100%;
                        height: 100%;
                    }
                }
            }
        }
    }
}

.active-item {
    background-color: var(--active-color);

    .text {
        color: #fff;
    }
}

.disabled {
    border-bottom: 1px solid #efefef;
    pointer-events: none;
    opacity: 0.4;
}

.cursor_pointer {
    cursor: default !important;
    pointer-events: none;
}
</style>