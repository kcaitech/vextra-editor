<script setup lang="ts">
import { Page, ResizingConstraints2, adapt2Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Select, { SelectItem, SelectSource } from '@/components/common/Select2.vue';
import { genOptions } from '@/utils/common';
import { useI18n } from 'vue-i18n';
import TypeHeader from '../TypeHeader.vue';
import { throttle } from 'lodash';

interface Props {
    context: Context;
    trigger: any[];
    selectionChange: number;
}
const { t } = useI18n();
const props = defineProps<Props>();
const mixed = t('attr.mixed');

const horizontalPositionSelected = ref<SelectItem>({ value: 'left', content: t('attr.fixed_left') });
const horizontalPositionOptions: SelectSource[] = genOptions([
    ['left', t('attr.fixed_left')],
    ['right', t('attr.fixed_right')],
    ['hcenter', t('attr.center')],
    ['lrfixed', t('attr.fixed_left_right')],
    ['hfollow', t('attr.follow_container')]
]);

const VerticalPositionSelected = ref<SelectItem>({ value: 'top', content: t('attr.fixed_top') });
const VerticalPositionOptions: SelectSource[] = genOptions([
    ['top', t('attr.fixed_top')],
    ['bottom', t('attr.fixed_bottom')],
    ['vcenter', t('attr.center')],
    ['tbfixed', t('attr.fixed_top_bottom')],
    ['vfollow', t('attr.follow_container')]
]);


function createEditor() {
    const page = props.context.selection.selectedPage!;
    return props.context.editor.editor4ResizingConstraint(adapt2Shape(page) as Page);
}

function handleHorizontalPositionSelect(item: SelectItem) {
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    switch (item.value) {
        case 'left':
            e.fixedToLeft(selected);
            break;
        case 'right':
            e.fixedToRight(selected);
            break;
        case 'hcenter':
            e.HorizontaljustifyCenter(selected);
            break;
        case 'lrfixed':
            e.fixedToLR(selected);
            break;
        case 'hfollow':
            e.flexWidth(selected);
            break;
        default:
            break;
    }
}

function handleVerticalPositionSelect(item: SelectItem) {
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    switch (item.value) {
        case 'top':
            e.fixedToTop(selected);
            break;
        case 'bottom':
            e.fixedToBottom(selected);
            break;
        case 'vcenter':
            e.VerticaljustifyCenter(selected);
            break;
        case 'tbfixed':
            e.fixedToTB(selected);
            break;
        case 'vfollow':
            e.flexHeight(selected);
            break;
        default:
            break;
    }
}


const disabled = ref(false)
const selected = ref()
function _update() {
    modifyhorizontalPositionStatus();
    modifyverticalPositionStatus();
    disabled.value = props.context.selection.selectedShapes.some(item => item.isVirtualShape);
    selected.value = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
}

function modifyhorizontalPositionStatus() {
    left.value = false
    right.value = false
    hcenter.value = false
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 1, l = shapes.length; i < l; i++) {
        let __rc = getGroupVal(shapes[i].resizingConstraint || 0);
        if (__rc !== commonRC) {
            horizontalPositionSelected.value = { value: 'mixed', content: mixed };
            return;
        }
    }

    let rc = shapes[0].resizingConstraint;
    if (rc === undefined) {
        rc = ResizingConstraints2.Mask;
    }

    if (ResizingConstraints2.isFixedLeftAndRight(rc)) {
        horizontalPositionSelected.value = { value: 'lrfixed', content: t('attr.fixed_left_right') };
        left.value = true
        right.value = true
    } else if (ResizingConstraints2.isFixedToLeft(rc)) {
        horizontalPositionSelected.value = { value: 'left', content: t('attr.fixed_left') };
        left.value = true
    } else if (ResizingConstraints2.isFixedToRight(rc)) {
        horizontalPositionSelected.value = { value: 'right', content: t('attr.fixed_right') };
        right.value = true
    } else if (ResizingConstraints2.isHorizontalJustifyCenter(rc)) {
        horizontalPositionSelected.value = { value: 'hcenter', content: t('attr.center') };
        hcenter.value = true
    } else if (ResizingConstraints2.isFlexWidth(rc)) {
        horizontalPositionSelected.value = { value: 'hfollow', content: t('attr.follow_container') }
    }

    function getGroupVal(val: number) {
        return ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Left) + ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Right);
    }
}

function modifyverticalPositionStatus() {
    top.value = false
    bottom.value = false
    vcenter.value = false
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 1, l = shapes.length; i < l; i++) {
        let __rc = getGroupVal(shapes[i].resizingConstraint || 0);
        if (__rc !== commonRC) {
            VerticalPositionSelected.value = { value: 'mixed', content: mixed };
            return;
        }
    }

    let rc = shapes[0].resizingConstraint;
    if (rc === undefined) {
        rc = ResizingConstraints2.Mask;
    }

    if (ResizingConstraints2.isFixedTopAndBottom(rc)) {
        VerticalPositionSelected.value = { value: 'tbfixed', content: t('attr.fixed_top_bottom') };
        top.value = true
        bottom.value = true
    } else if (ResizingConstraints2.isFixedToTop(rc)) {
        VerticalPositionSelected.value = { value: 'top', content: t('attr.fixed_top') };
        top.value = true
    } else if (ResizingConstraints2.isFixedToBottom(rc)) {
        VerticalPositionSelected.value = { value: 'bottom', content: t('attr.fixed_bottom') };
        bottom.value = true
    } else if (ResizingConstraints2.isVerticalJustifyCenter(rc)) {
        VerticalPositionSelected.value = { value: 'vcenter', content: t('attr.center') };
        vcenter.value = true
    } else if (ResizingConstraints2.isFlexHeight(rc)) {
        VerticalPositionSelected.value = { value: 'hfollow', content: t('attr.follow_container') }
    }

    function getGroupVal(val: number) {
        return ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Top) + ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Bottom);
    }
}

const left = ref(false)
const right = ref(false)
const top = ref(false)
const bottom = ref(false)
const hcenter = ref(false)
const vcenter = ref(false)

const update = throttle(_update, 120);

// 这里在下代协作算法出来后可以优化
const stop = watch(() => props.trigger, update); // 监听图层变化
const stop2 = watch(() => props.selectionChange, update); // 监听选区变化

onMounted(update);
onUnmounted(() => {
    stop();
    stop2();
});
</script>
<template>
    <div class="wrap">
        <TypeHeader :title="t('attr.constraints')" class="mt-24" :active="!disabled">
        </TypeHeader>
        <div class="content" :class="{ 'disabled': disabled }">
            <div class="show">
                <div class="top">
                    <div class="one">
                        <div class="line" :class="{ action1: top }" @click="createEditor().fixedToTop(selected)"></div>
                    </div>
                </div>
                <div class="center">
                    <div class="one">
                        <div class="line" :class="{ action: left }" @click="createEditor().fixedToLeft(selected)"></div>
                    </div>
                    <div class="two">
                        <div class="LR" :class="{ action: hcenter }"
                            @click="createEditor().HorizontaljustifyCenter(selected)"></div>
                        <div class="TB" :class="{ action1: vcenter }"
                            @click="createEditor().VerticaljustifyCenter(selected)"></div>
                    </div>
                    <div class="three">
                        <div class="line" :class="{ action: right }" @click="createEditor().fixedToRight(selected)"></div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="one">
                        <div class="line" :class="{ action1: bottom }" @click="createEditor().fixedToBottom(selected)">
                        </div>
                    </div>
                </div>
            </div>
            <div class="main">
                <div class="row">
                    <label>{{ t('attr.horizontal') }}</label>
                    <Select :selected="horizontalPositionSelected" :source="horizontalPositionOptions"
                        @select="handleHorizontalPositionSelect" :disabled="disabled"></Select>
                </div>
                <div class="row">
                    <label>{{ t('attr.vertical') }}</label>
                    <Select :selected="VerticalPositionSelected" :source="VerticalPositionOptions"
                        @select="handleVerticalPositionSelect" :disabled="disabled"></Select>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped lang="scss">
.action {
    height: 2px !important;
    background-color: #18f !important;
}

.action1 {
    width: 2px !important;
    background-color: #18f !important;
}

.disabled {
    opacity: 0.4;
    z-index: -1;
}

.wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px 18px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .content {
        display: flex;
        align-items: center;
        gap: 12px;

        .main {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .row {
                width: 100%;
                display: flex;
                align-content: center;

                >label {
                    flex: 0 0 42px;
                    line-height: 32px;
                }

                >.select-container {
                    flex: 0 1 84px;
                    height: 32px;
                }
            }
        }

        .show {
            box-sizing: border-box;
            isolation: isolate;
            grid-column: 2 / span 8;
            grid-row: 1 / span 2;
            display: flex;
            flex-direction: column;
            position: relative;
            border: 1px solid var(--color-border, #e5e5e5);
            border-radius: 2px;

            .top {
                flex: 0 0 auto;
                height: 12px;
                display: flex;
                justify-content: center;
                align-items: center;

                .one {
                    flex: 0 0 25px;
                    height: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .line {
                        flex: 0 0 auto;
                        --height: 8px;
                        --width: 1px;
                        height: var(--height);
                        width: var(--width);
                        background-color: #333333;
                        position: relative;
                    }

                    .line::before {
                        content: "";
                        display: none;
                        position: absolute;
                        width: 6px;
                        height: 8px;
                        left: -2px;
                        background-color: rgba(17, 136, 255, 0.5);
                    }

                    .line:hover {
                        &::before {
                            display: block;
                        }
                    }
                }
            }


            .center {
                flex: 1 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .one {
                    flex: 0 0 auto;
                    height: 25px;
                    width: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .line {
                        flex: 0 0 auto;
                        --height: 1px;
                        --width: 8px;
                        height: var(--height);
                        width: var(--width);
                        background-color: #333333;
                        position: relative;
                    }

                    .line::before {
                        content: "";
                        display: none;
                        position: absolute;
                        width: 10px;
                        height: 5px;
                        left: -1px;
                        top: -1px;
                        background-color: rgba(17, 136, 255, 0.5);
                    }

                    .line:hover {
                        &::before {
                            display: block;
                        }
                    }
                }

                .two {
                    flex: 0 0 auto;
                    position: relative;
                    height: 38px;
                    width: 38px;
                    border: 1px solid var(--color-icon, #333333);
                    border-radius: 1px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .LR {
                        --height: 1px;
                        --width: 14px;
                        height: var(--height);
                        width: var(--width);
                        background-color: #333333;
                        position: relative;

                        &::before {
                            content: "";
                            display: none;
                            position: absolute;
                            width: 14px;
                            height: 5px;
                            top: -2px;
                            background-color: rgba(17, 136, 255, 0.5);
                        }

                        &:hover::before {
                            display: block;
                        }
                    }

                    .TB {
                        --height: 14px;
                        --width: 1px;
                        height: var(--height);
                        width: var(--width);
                        background-color: #333333;
                        position: absolute;

                        &::before {
                            content: "";
                            display: none;
                            position: absolute;
                            width: 5px;
                            height: 14px;
                            left: -2px;
                            background-color: rgba(17, 136, 255, 0.5);
                        }

                        &:hover::before {
                            display: block;
                        }
                    }
                }

                .three {
                    flex: 0 0 auto;
                    height: 25px;
                    width: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .line {
                        flex: 0 0 auto;
                        --height: 1px;
                        --width: 8px;
                        height: var(--height);
                        width: var(--width);
                        background-color: #333333;
                        position: relative;
                    }

                    .line::before {
                        content: "";
                        display: none;
                        position: absolute;
                        width: 10px;
                        height: 5px;
                        left: -1px;
                        top: -1px;
                        background-color: rgba(17, 136, 255, 0.5);
                    }

                    .line:hover {
                        &::before {
                            display: block;
                        }
                    }
                }
            }

            .bottom {
                flex: 0 0 auto;
                height: 12px;
                display: flex;
                justify-content: center;
                align-items: center;

                .one {
                    flex: 0 0 25px;
                    height: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .line {
                        flex: 0 0 auto;
                        --height: 8px;
                        --width: 1px;
                        height: var(--height);
                        width: var(--width);
                        background-color: #333333;
                        position: relative;
                    }

                    .line::before {
                        content: "";
                        display: none;
                        position: absolute;
                        width: 6px;
                        height: 8px;
                        left: -2px;
                        background-color: rgba(17, 136, 255, 0.5);
                    }

                    .line:hover {
                        &::before {
                            display: block;
                        }
                    }
                }
            }
        }
    }


}
</style>