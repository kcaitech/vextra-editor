/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { StackAlign } from '@kcdesign/data';
import { Context } from '@/context';
import { useI18n } from "vue-i18n";
import Tooltip from '@/components/common/Tooltip.vue';
import { AutolayoutCtx } from './ctx';
const { t } = useI18n();

const props = defineProps<{
    autoLayoutDate: AutolayoutCtx
    context: Context
}>();

type AlignPosition =
    'left' |
    'center' |
    'right'

const position = (posi: AlignPosition) => {
    const counter = props.autoLayoutDate.stackCounterAlignItems;
    if (posi === 'left' && (!counter || counter === StackAlign.Min)) {
        return true;
    } else if (posi === 'center' && counter === StackAlign.Center) {
        return true;
    } else if (posi === 'right' && counter === StackAlign.Max) {
        return true;
    } else {
        return false;
    }
}

const changeAlignMode = (primary: StackAlign, counter: StackAlign) => {
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.modifyAutoLayoutAlignItems(shapes, primary, counter);
}
</script>

<template>
    <div class="ver-align-container">
        <div class="base" :class="{ active: position('left') }"
            @click="changeAlignMode(StackAlign.Min, StackAlign.Min)">
            <Tooltip :content="t(`autolayout.lc_align`)">
                <div class="base">
                    <div class="box">
                        <div class="dot"></div>
                        <div class="t-ver ver-align" style="padding-top: 6px; padding-bottom: 2px; align-items: start;">
                            <div class="right"></div>
                            <div class="left"></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="c-ver ver-align" style="align-items: start;">
                            <div></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="t-ver ver-align" style="padding-bottom: 6px; padding-top: 2px; align-items: start;">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                </div>
            </Tooltip>
        </div>
        <div class="base" :class="{ active: position('center') }"
            @click="changeAlignMode(StackAlign.Min, StackAlign.Center)">
            <Tooltip :content="t(`autolayout.center_align`)">
                <div class="base">
                    <div class="box">
                        <div class="dot"></div>
                        <div class="t-ver ver-align" style="padding-top: 6px; padding-bottom: 2px;">
                            <div class="right"></div>
                            <div class="left"></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="c-ver ver-align">
                            <div></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="t-ver ver-align" style="padding-bottom: 6px; padding-top: 2px;">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                </div>
            </Tooltip>
        </div>
        <div class="base" :class="{ active: position('right') }"
            @click="changeAlignMode(StackAlign.Min, StackAlign.Max)">
            <Tooltip :content="t(`autolayout.rc_align`)">
                <div class="base">
                    <div class="box">
                        <div class="dot"></div>
                        <div class="t-ver ver-align" style="padding-top: 6px; padding-bottom: 2px; align-items: end;">
                            <div class="right"></div>
                            <div class="left"></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="c-ver ver-align" style="align-items: end;">
                            <div></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="t-ver ver-align" style="padding-bottom: 6px; padding-top: 2px; align-items: end;">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                </div>
            </Tooltip>
        </div>
    </div>
</template>

<style scoped lang="scss">
.ver-align-container {
    width: 72px;
    height: 72px;
    border-radius: 6px;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;

    .base {
        flex: 1;
        height: 100%;


        .box {
            position: relative;
            display: flex;
            height: 24px;
            width: 100%;

            .dot {
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background-color: #BFBFBF;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }


            .ver-align {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0px 4px;
                position: absolute;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                z-index: 9;
            }

            .t-ver {
                justify-content: space-between;

                >div {
                    height: 4px;
                    border-radius: 1px;
                }

                .left {
                    width: 10px;
                }

                .right {
                    width: 7px;
                }
            }

            .c-ver {
                justify-content: center;

                >div {
                    height: 4px;
                    width: 16px;
                    border-radius: 1px;
                }
            }

            .b-ver {
                justify-content: space-between;

                >div {
                    height: 4px;
                    border-radius: 1px;
                }

                .left {
                    width: 7px;
                }

                .right {
                    width: 10px;
                }
            }
        }

        &:hover {
            .ver-align {
                background-color: #fff;

                >div {
                    background-color: rgba(25, 137, 252, 0.4);
                }
            }
        }
    }
}

.active {
    .ver-align {
        background-color: #fff;

        >div {
            background-color: #1989FC !important;
        }
    }
}
</style>