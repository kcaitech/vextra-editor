/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { StackAlign, StackMode, StackSizing, StackWrap } from '@kcdesign/data';
import WrapAlignBox from './WrapAlignBox.vue';
import HorAlignBox from './HorAlignBox.vue';
import VerAlignBox from './VerAlignBox.vue';
import HorGapAuto from './HorGapAuto.vue';
import VerGapAuto from './VerGapAuto.vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { Context } from '@/context';
import { AutolayoutCtx } from './ctx';

const props = defineProps<{
    autoLayoutDate: AutolayoutCtx
    context: Context
    reflush: number
}>();


type AlignPosition =
    'lt' |
    'ct' |
    'rt' |
    'lc' |
    'cc' |
    'rc' |
    'lb' |
    'cb' |
    'rb'

const position = (posi: AlignPosition) => {
    const primary = props.autoLayoutDate.stackPrimaryAlignItems;
    const counter = props.autoLayoutDate.stackCounterAlignItems;
    if (posi === 'lt' && (!primary || primary === StackAlign.Min) && (!counter || counter === StackAlign.Min)) {
        return true;
    } else if (posi === 'ct' && primary === StackAlign.Min && counter === StackAlign.Center) {
        return true;
    } else if (posi === 'rt' && primary === StackAlign.Min && counter === StackAlign.Max) {
        return true;
    } else if (posi === 'lc' && primary === StackAlign.Center && counter === StackAlign.Min) {
        return true;
    } else if (posi === 'cc' && primary === StackAlign.Center && counter === StackAlign.Center) {
        return true;
    } else if (posi === 'rc' && primary === StackAlign.Center && counter === StackAlign.Max) {
        return true;
    } else if (posi === 'lb' && primary === StackAlign.Max && counter === StackAlign.Min) {
        return true;
    } else if (posi === 'cb' && primary === StackAlign.Max && counter === StackAlign.Center) {
        return true;
    } else if (posi === 'rb' && primary === StackAlign.Max && counter === StackAlign.Max) {
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
    <HorGapAuto :reflush="reflush"
        v-if="autoLayoutDate.stackHorizontalGapSizing === StackSizing.Auto && autoLayoutDate.stackMode !== StackMode.Vertical"
        :autoLayoutDate="autoLayoutDate" :context="context"></HorGapAuto>
    <VerGapAuto :reflush="reflush"
        v-else-if="autoLayoutDate.stackVerticalGapSizing === StackSizing.Auto && autoLayoutDate.stackMode === StackMode.Vertical"
        :autoLayoutDate="autoLayoutDate" :context="context"></VerGapAuto>
    <div class="align-container" v-else>
        <div class="base">
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    align="start" @change="changeAlignMode(StackAlign.Min, StackAlign.Min)" :show="position('lt')"
                    name="lt_align">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Min, StackAlign.Min)" name="lt_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="start" :show="position('lt')">
                </HorAlignBox>
                <VerAlignBox align="start" name="lt_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    @change="changeAlignMode(StackAlign.Min, StackAlign.Min)" :show="position('lt')">
                </VerAlignBox>
            </div>
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    align="center" :show="position('ct')" name="ct_align"
                    @change="changeAlignMode(StackAlign.Min, StackAlign.Center)">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Min, StackAlign.Center)" name="ct_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="start" :show="position('ct')">
                </HorAlignBox>
                <VerAlignBox align="center" name="ct_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    @change="changeAlignMode(StackAlign.Min, StackAlign.Center)" :show="position('ct')">
                </VerAlignBox>
            </div>
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    align="end" :show="position('rt')" @change="changeAlignMode(StackAlign.Min, StackAlign.Max)"
                    name="rt_align">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Min, StackAlign.Max)" name="rt_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="start" :show="position('rt')">
                </HorAlignBox>
                <VerAlignBox align="end" name="rt_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    :show="position('rt')" @change="changeAlignMode(StackAlign.Min, StackAlign.Max)">
                </VerAlignBox>
            </div>
        </div>
        <div class="base">
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    align="start" :show="position('lc')" name="lc_align"
                    @change="changeAlignMode(StackAlign.Center, StackAlign.Min)">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Center, StackAlign.Min)" name="lc_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="center" :show="position('lc')">
                </HorAlignBox>
                <VerAlignBox align="start" name="lc_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    :show="position('lc')" @change="changeAlignMode(StackAlign.Center, StackAlign.Min)">
                </VerAlignBox>
            </div>
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    align="center" :show="position('cc')" name="center_align"
                    @change="changeAlignMode(StackAlign.Center, StackAlign.Center)">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Center, StackAlign.Center)" name="center_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="center" :show="position('cc')">
                </HorAlignBox>
                <VerAlignBox align="center" name="center_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    :show="position('cc')" @change="changeAlignMode(StackAlign.Center, StackAlign.Center)">
                </VerAlignBox>
            </div>
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    name="rc_align" align="end" :show="position('rc')"
                    @change="changeAlignMode(StackAlign.Center, StackAlign.Max)">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Center, StackAlign.Max)" name="rc_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="center" :show="position('rc')">
                </HorAlignBox>
                <VerAlignBox align="end" name="rc_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    :show="position('rc')" @change="changeAlignMode(StackAlign.Center, StackAlign.Max)">
                </VerAlignBox>
            </div>
        </div>
        <div class="base">
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    name="lb_align" align="start" :show="position('lb')"
                    @change="changeAlignMode(StackAlign.Max, StackAlign.Min)">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Max, StackAlign.Min)" name="lb_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="end" :show="position('lb')">
                </HorAlignBox>
                <VerAlignBox align="start" name="lb_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    :show="position('lb')" @change="changeAlignMode(StackAlign.Max, StackAlign.Min)">
                </VerAlignBox>
            </div>
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    name="cb_align" align="center" :show="position('cb')"
                    @change="changeAlignMode(StackAlign.Max, StackAlign.Center)">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Max, StackAlign.Center)" name="cb_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="end" :show="position('cb')">
                </HorAlignBox>
                <VerAlignBox align="center" name="cb_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    :show="position('cb')" @change="changeAlignMode(StackAlign.Max, StackAlign.Center)">
                </VerAlignBox>
            </div>
            <div>
                <div class="dot"></div>
                <WrapAlignBox v-if="(!autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap)"
                    name="rb_align" align="end" :show="position('rb')"
                    @change="changeAlignMode(StackAlign.Max, StackAlign.Max)">
                </WrapAlignBox>
                <HorAlignBox @change="changeAlignMode(StackAlign.Max, StackAlign.Max)" name="rb_align"
                    v-if="(autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap)"
                    align="end" :show="position('rb')">
                </HorAlignBox>
                <VerAlignBox align="end" name="rb_align"
                    v-if="autoLayoutDate.stackVerticalGapSizing !== StackSizing.Auto && (autoLayoutDate.stackMode === StackMode.Vertical)"
                    :show="position('rb')" @change="changeAlignMode(StackAlign.Max, StackAlign.Max)">
                </VerAlignBox>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.align-container {
    width: 72px;
    height: 72px;
    border-radius: 6px;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;

    .base {
        width: 100%;
        flex: 1;
        display: flex;

        >div {
            position: relative;
            flex: 1;
            display: flex;
            height: 100%;

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

            .align {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                position: absolute;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                z-index: 9;

                &:hover {
                    .align {
                        background-color: #fff;

                        >div {
                            background-color: rgba(25, 137, 252, 0.4);
                        }
                    }
                }
            }

            .l-hor {
                >div {
                    width: 4px;
                    border-radius: 1px;
                }

                .left {
                    height: 10px;
                }

                .right {
                    height: 7px;
                }
            }

            .c-hor {
                >div {
                    width: 4px;
                    height: 16px;
                    border-radius: 1px;
                }
            }

            .r-hor {
                >div {
                    width: 4px;
                    border-radius: 1px;
                }

                .left {
                    height: 7px;
                }

                .right {
                    height: 10px;
                }
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

                &:hover {
                    background-color: #fff;

                    >div {
                        background-color: rgba(25, 137, 252, 0.4);
                    }
                }
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
    }
}

.active {
    background-color: #fff;

    >div {
        background-color: #1989FC !important;
    }
}
</style>