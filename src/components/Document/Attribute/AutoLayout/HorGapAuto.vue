<script setup lang="ts">
import { AutoLayout, StackAlign } from '@kcdesign/data';
import { Context } from '@/context';
import { useI18n } from "vue-i18n";
import Tooltip from '@/components/common/Tooltip.vue';
const { t } = useI18n();

const props = defineProps<{
    autoLayoutDate: AutoLayout
    context: Context
}>();

type AlignPosition =
    'top' |
    'center' |
    'bottom'

const position = (posi: AlignPosition) => {
    const primary = props.autoLayoutDate.stackPrimaryAlignItems;
    if (posi === 'top' && (!primary || primary === StackAlign.Min)) {
        return true;
    } else if (posi === 'center' && primary === StackAlign.Center) {
        return true;
    } else if (posi === 'bottom' && primary === StackAlign.Max) {
        return true;
    } else {
        return false;
    }
}

const changeAlignMode = (primary: StackAlign, counter: StackAlign) => {
    const shape = props.context.selection.selectedShapes[0];
    const editor = props.context.editor4Shape(shape);

    editor.modifyAutoLayoutAlignItems(primary, counter);
}
</script>

<template>
    <div class="hor-align-container">
        <div class="base" :class="{ active: position('top') }" @click="changeAlignMode(StackAlign.Min, StackAlign.Min)">
            <Tooltip :content="t(`autolayout.top_align`)">
                <div class="base">
                    <div class="box">
                        <div class="dot"></div>
                        <div class="l-hor align" style="padding-left: 6px; padding-right: 2px;">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="c-hor align" style="justify-content: center;">
                            <div></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="r-hor align" style="padding-left: 2px; padding-right: 6px;">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                </div>
            </Tooltip>
        </div>
        <div class="base" :class="{ active: position('center') }"
            @click="changeAlignMode(StackAlign.Center, StackAlign.Min)">
            <Tooltip :content="t(`autolayout.center_align`)">
                <div class="base">
                    <div class="box">
                        <div class="dot"></div>
                        <div class="l-hor align" style="align-items:center; padding-left: 6px; padding-right: 2px;">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="c-hor align" style="align-items:center; justify-content: center;">
                            <div></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="r-hor align" style="align-items:center; padding-left: 2px; padding-right: 6px;">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                </div>
            </Tooltip>
        </div>
        <div class="base" :class="{ active: position('bottom') }"
            @click="changeAlignMode(StackAlign.Max, StackAlign.Min)">
            <Tooltip :content="t(`autolayout.bottom_align`)">
                <div class="base">
                    <div class="box">
                        <div class="dot"></div>
                        <div class="l-hor align" style="align-items:end; padding-left: 6px; padding-right: 2px;">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="c-hor align" style="align-items:end; justify-content: center;">
                            <div></div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="dot"></div>
                        <div class="r-hor align" style="align-items:end; padding-left: 2px; padding-right: 6px;">
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
.hor-align-container {
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

        .box {
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


        }

        &:hover {
            .align {
                background-color: #fff;

                >div {
                    background-color: rgba(25, 137, 252, 0.4);
                }
            }
        }
    }
}

.active {
    .align {
        background-color: #fff;

        >div {
            background-color: #1989FC !important;
        }
    }
}
</style>