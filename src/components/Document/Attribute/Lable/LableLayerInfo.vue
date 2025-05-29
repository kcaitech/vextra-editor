/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import LableType from './LableType.vue'
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { Selection } from '@/context/selection';
import { get_height, get_rotation, get_width, get_xy } from '@/utils/attri_setting';
import { ShapeView } from '@kcdesign/data';
import { Menu } from '@/context/menu';
import LableTootip from './LableTootip.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const props = defineProps<{
    context: Context
}>();
const name = ref('');
const xy = ref({ x: 0, y: 0 });
const size = ref({ w: 0, h: 0 });
const rotate = ref(0);
let radius = reactive<{ lt: number, rt: number, rb: number, lb: number }>({ lt: 0, rt: 0, rb: 0, lb: 0 });
const watchedShapes = new Map();
const unit = ['pt', 'px', 'dp', 'rpx'];
const copy_text = ref(false);

const _visible = ref();
const platfrom = ref(props.context.menu.isPlatform);
const multiple = ref(props.context.menu.isMulriple);
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(getShapeInfo);
        watchedShapes.delete(k);
    })
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        watchedShapes.set(first.id, first);
        watchedShapes.forEach((v) => { v.watch(getShapeInfo); });
    }
}
const getShapeInfo = () => {
    const selected = props.context.selection.selectedShapes;
    const len = selected.length;
    if (len === 1) {
        const shape = selected[0];
        const _xy = get_xy(selected, '');
        xy.value.x = +(_xy.x as number * multiple.value).toFixed(2);
        xy.value.y = +(_xy.y as number * multiple.value).toFixed(2);
        rotate.value = get_rotation(shape);
        getRadius(shape);
        size.value.w = +(+get_width(selected, '') * multiple.value).toFixed(2);
        size.value.h = +(+get_height(selected, '') * multiple.value).toFixed(2);
        name.value = shape.name;
    }
}

const getRadius = (shape: ShapeView) => {
    const r = shape.radius;
    if (r.length === 4) {
        radius.lt = r[0] * multiple.value;
        radius.rt = r[1] * multiple.value;
        radius.rb = r[2] * multiple.value;
        radius.lb = r[3] * multiple.value;
    } else {
        const mixed = r.every((v: number) => v === r[0]);
        if(!mixed) return radius = { lt: 0, rt: 0, rb: 0, lb: 0 };
        radius.lt = r[0] * multiple.value;
        radius.rt = r[0] * multiple.value;
        radius.rb = r[0] * multiple.value;
        radius.lb = r[0] * multiple.value;
    }
}
function selection_wather(t: any) {
    if (t === Selection.CHANGE_SHAPE) {
        watch_shapes();
        getShapeInfo();
    }
}
const innerRaduis = (r: { lt: number, rt: number, rb: number, lb: number }, type: string, bool?: boolean) => {
    const { lt, rt, rb, lb } = r
    if (lt === rt && lt === rb && lt === lb) {
        if (bool) {
            return lt > 0;
        } else {
            return lt + `${type}`;
        }
    } else {
        return `${lt}${type} ${rt}${type} ${rb}${type} ${lb}${type}`;
    }
}

const copyLable = async (e: MouseEvent, v: string) => {
    const clickedDiv = e.target as HTMLDivElement; // 获取点击的<div>元素
    const text = clickedDiv.textContent;
    if (text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(() => {
                copy_text.value = true;
                _visible.value = v;
            }, () => {
                console.log(`${t('lable.copyfailure')}`);
            })
        } else {
            const textArea = document.createElement('textarea')
            textArea.value = text;
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            document.execCommand('copy')
            copy_text.value = true;
            _visible.value = v;
            textArea.remove()
        }
    }
}

const menu_watcher = (t: number) => {
    if (t === Menu.LABLE_PLATFORM_CHANGE) {
        platfrom.value = props.context.menu.isPlatform;
        getShapeInfo();
    }
    if (t === Menu.LABLE_MULRIPLE) {
        multiple.value = props.context.menu.isMulriple;
        getShapeInfo();
    }
}

// hooks
onMounted(() => {
    watch_shapes();
    getShapeInfo();
    props.context.selection.watch(selection_wather);
    props.context.menu.watch(menu_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.menu.unwatch(menu_watcher);
})
</script>

<template>
    <div class="container">
        <LableType :title="t('lable.layer_info')">
            <template #body>
                <div class="row">
                    <span class="named">{{ t('lable.name') }}</span>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'name'">
                        <div><span class="name hovered" @click="(e) => copyLable(e, 'name')"
                                style="cursor: pointer;font-weight: 500;"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ name }}</span></div>
                    </LableTootip>
                </div>
                <div class="row">
                    <span class="named">{{ t('lable.posi') }}</span>
                    <div style="display: flex;">
                        <span style="display: flex; width: 50%; align-items: center;"><span class="name"
                                style="color: #8C8C8C; font-weight: 500;width: 14px">X</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'x'">
                                <span @click="(e) => copyLable(e, 'x')" style="cursor: pointer;font-weight: 500;" class="hovered"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">
                                    {{ xy.x }}{{ unit[platfrom] }}
                                </span>
                            </LableTootip>
                        </span>
                        <span style="display: flex; width: 50%; align-items: center;"><span class="name"
                                style="color: #8C8C8C; font-weight: 500;width: 14px">Y</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'y'">
                                <span @click="(e) => copyLable(e, 'y')" style="cursor: pointer;font-weight: 500;" class="hovered"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ xy.y }}{{
            unit[platfrom]
        }}</span>
                            </LableTootip>
                        </span>
                    </div>
                </div>
                <div class="row">
                    <span class="named">{{ t('lable.size') }}</span>
                    <div style="display: flex;">
                        <span style="display: flex; width: 50%; align-items: center;"><span class="name"
                                style="color: #8C8C8C; font-weight: 500; width: 14px; font-size: 10px;">W</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'w'">
                                <span @click="(e) => copyLable(e, 'w')" style="cursor: pointer;font-weight: 500;" class="hovered"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">
                                    {{ size.w }}{{ unit[platfrom] }}
                                </span>
                            </LableTootip>
                        </span>
                        <span style="display: flex; width: 50%; align-items: center;"><span class="name"
                                style="color: #8C8C8C; font-weight: 500;width: 14px">H</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'h'">
                                <span @click="(e) => copyLable(e, 'h')" style="cursor: pointer;font-weight: 500;" class="hovered"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">
                                    {{ size.h }}{{ unit[platfrom] }}
                                </span>
                            </LableTootip>
                        </span>
                    </div>
                </div>
                <div class="row" v-if="rotate > 0">
                    <span class="named">{{ t('lable.rotate') }}</span>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'rotate'">
                        <div><span @click="(e) => copyLable(e, 'rotate')" style="cursor: pointer;font-weight: 500;" class="hovered"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ rotate }}deg</span></div>
                    </LableTootip>
                </div>
                <!-- <div class="row">
                    <span class="named">不透明度</span>
                    <div></div>
                </div> -->
                <div class="row" v-if="innerRaduis(radius, unit[platfrom], true)">
                    <span class="named">{{ t('lable.raduis') }}</span>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'radius'">
                        <div><span class="name hovered" @click="(e) => copyLable(e, 'radius')"
                                style="cursor: pointer;font-weight: 500;"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ innerRaduis(radius,
                                unit[platfrom]) }}</span></div>
                    </LableTootip>
                </div>
            </template>
        </LableType>
    </div>
</template>

<style scoped lang="scss">
.named {
    display: block;
    width: 58px;
    color: #8C8C8C;
}

.row {
    height: 34px;
    align-items: center;
    display: flex;
    color: #000;

    >div {
        height: 100%;
        display: flex;
        align-items: center;
        width: calc(100% - 58px);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.hovered {
    padding: 3px;
    border-radius: 4px;
    &:hover {
        border-radius: 2px;
        background-color: #EBEBEB;
    }
}
</style>