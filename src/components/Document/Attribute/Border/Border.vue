<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { Context } from '@/context';
import { Shape } from '@kcdesign/data';
import TypeHeader from '../TypeHeader.vue';
import BorderDetail from './BorderDetail.vue';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { useI18n } from 'vue-i18n';
import { Color, Border, ContextSettings, BorderStyle, MarkerType } from '@kcdesign/data';
import { FillType, BlendMode, BorderPosition } from '@kcdesign/data';
import { Reg_HEX } from "@/utils/RegExp";
import { message } from "@/utils/message";
import { toHex } from "@/utils/color";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { get_borders, get_actions_add_boder, get_actions_border_color, get_actions_border_unify, get_actions_border_enabled, get_actions_border_delete } from '@/utils/shape_style';
import { v4 } from 'uuid';
interface BorderItem {
    id: number
    border: Border
}
interface Props {
    context: Context
    shapes: Shape[]
}
const { t } = useI18n();
const props = defineProps<Props>();
const data: { borders: BorderItem[] } = reactive({ borders: [] });
const { borders } = data;
const alphaBorder = ref<any>();
const colorBorder = ref<any>()
const mixed = ref<boolean>(false);
const editor = computed(() => props.context.editor4Shape(props.shapes[0]));
const watchedShapes = new Map();
const len = computed<number>(() => props.shapes.length);

function watchShapes() {
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }
    if (selection.selectedShapes.length > 0) {
        selection.selectedShapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}
function watcher(...args: any[]) {
    if (args.length > 0 && args.includes('style')) updateData();
}
function updateData() {
    borders.length = 0;
    mixed.value = false;
    if (len.value === 1) {
        const style = props.shapes[0].style;
        for (let i = 0, l = style.borders.length; i < l; i++) {
            const border = style.borders[i];
            const b: BorderItem = {
                id: i,
                border: border
            }
            borders.unshift(b);
        }
    } else if (len.value > 1) {
        const _bs = get_borders(props.shapes);
        if (_bs === 'mixed') {
            mixed.value = true;
        } else {
            borders.unshift(..._bs);
        }
    }
}
function addBorder() {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    const color = new Color(1, 0, 0, 0);
    const contextSettings = new ContextSettings(BlendMode.Normal, 1);
    const borderStyle = new BorderStyle(0, 0);
    const border = new Border(v4(), true, FillType.SolidColor, color, contextSettings, BorderPosition.Outer, 1, borderStyle);
    if (len.value === 1) {
        editor.value.addBorder(border);
    } else if (len.value > 1) {
        if (mixed.value) {
            const actions = get_actions_border_unify(props.shapes);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesBordersUnify(actions);
            }
        } else {
            const actions = get_actions_add_boder(props.shapes, border);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddBorder(actions);
            }
        }
    }
    props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function first() {
    if (borders.length === 0 && !mixed.value) {
        addBorder()
    }
}
function deleteBorder(idx: number) {
    const _idx = borders.length - idx - 1;
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    if (len.value === 1) {
        editor.value.deleteBorder(_idx);
    } else if (len.value > 1) {
        const actions = get_actions_border_delete(props.shapes, _idx);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteBorder(actions);
        }
    }
    props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function toggleVisible(idx: number) {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    const border = borders[idx].border;
    const isEnabled = !border.isEnabled;
    const _idx = borders.length - idx - 1;
    if (len.value === 1) {
        editor.value.setBorderEnable(_idx, isEnabled);
    } else if (len.value > 1) {
        const actions = get_actions_border_enabled(props.shapes, idx, isEnabled);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderEnabled(actions);
        }
    }
    props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function onColorChange(e: Event, idx: number) {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    let value = (e.target as HTMLInputElement)?.value;
    if (value.slice(0, 1) !== '#') {
        value = "#" + value
    }
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    const hex = value.match(Reg_HEX);
    const border = borders[idx].border;
    if (!hex) {
        message('danger', t('system.illegal_input'));
        return (e.target as HTMLInputElement).value = (toHex(borders[idx].border.color)).slice(1)
    }
    const r = Number.parseInt(hex[1], 16);
    const g = Number.parseInt(hex[2], 16);
    const b = Number.parseInt(hex[3], 16);
    const alpha = border.color.alpha;
    const color = new Color(alpha, r, g, b);
    const _idx = borders.length - idx - 1;
    if (len.value === 1) {
        editor.value.setBorderColor(_idx, color);
    } else if (len.value > 1) {
        const actions = get_actions_border_color(props.shapes, _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderColor(actions);
        }
    }
    props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function onAlphaChange(e: Event, idx: number) {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    let alpha = (e.currentTarget as any)['value']
    if (alphaBorder.value) {
        if (alpha?.slice(-1) === '%') {
            alpha = Number(alpha?.slice(0, -1))
            if (isNaN(alpha) || alpha < 0) {
                message('danger', t('system.illegal_input'));
                return (e.target as HTMLInputElement).value = (borders[idx].border.color.alpha * 100) + '%';
            }
            if (alpha > 100) {
                alpha = 100;
            }
            alpha = alpha.toFixed(2) / 100
            const border = borders[idx].border;
            const { red, green, blue } = border.color
            const color = new Color(alpha, red, green, blue);
            const _idx = borders.length - idx - 1;
            if (len.value === 1) {
                editor.value.setBorderColor(_idx, color);
            } else if (len.value > 1) {
                const actions = get_actions_border_color(props.shapes, _idx, color);
                const page = props.context.selection.selectedPage;
                if (page) {
                    const editor = props.context.editor4Page(page);
                    editor.setShapesBorderColor(actions);
                }
            }
        } else {
            if (!isNaN(Number(alpha)) && alpha >= 0) {
                if (alpha > 100) {
                    alpha = 100
                }
                alpha = Number((Number(alpha)).toFixed(2)) / 100
                const border = borders[idx].border;
                const { red, green, blue } = border.color
                const color = new Color(alpha, red, green, blue);
                const _idx = borders.length - idx - 1;
                editor.value.setBorderColor(_idx, color);
            } else {
                message('danger', t('system.illegal_input'));
                return (e.target as HTMLInputElement).value = (borders[idx].border.color.alpha * 100) + '%'
            }
        }
    }
    props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function getColorFromPicker(color: Color, idx: number) {
    const _idx = borders.length - idx - 1;
    if (len.value === 1) {
        editor.value.setBorderColor(_idx, color);
    } else if (len.value > 1) {
        const actions = get_actions_border_color(props.shapes, _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderColor(actions);
        }
    }
}
function selection_wather(t: any) {
    if ([Selection.CHANGE_PAGE, Selection.CHANGE_SHAPE].includes(t)) {
        watchShapes();
        updateData();
    }
}

const selectColor = (i: number) => {
    if (colorBorder.value) {
        colorBorder.value[i].select()
    }
}
const selectAlpha = (i: number) => {
    if (alphaBorder.value) {
        alphaBorder.value[i].select();
    }
}
const filterAlpha = (a: number) => {
    let alpha = Math.round(a * 100) / 100;
    if (Number.isInteger(alpha)) {
        return alpha.toFixed(0); // 返回整数形式
    } else if (Math.abs(alpha * 10 - Math.round(alpha * 10)) < Number.EPSILON) {
        return alpha.toFixed(1); // 保留一位小数
    } else {
        return alpha.toFixed(2); // 保留两位小数
    }
}
// hooks
onMounted(() => {
    props.context.selection.watch(selection_wather);
    watchShapes();
    updateData();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})
watchEffect(updateData);
</script>

<template>
    <div class="border-panel">
        <TypeHeader :title="t('attr.border')" class="mt-24" @click="first">
            <template #tool>
                <div class="add" @click="addBorder">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </template>
        </TypeHeader>
        <div class="tips-wrap" v-if="mixed">
            <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
        </div>
        <div class="borders-container" v-else-if="!mixed">
            <div class="border" v-for="(b, idx) in borders" :key="b.id">
                <div :class="b.border.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                    <svg-icon v-if="b.border.isEnabled" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <ColorPicker :color="b.border.color" :context="props.context"
                        @change="(c: Color) => getColorFromPicker(c, idx)" />
                    <input ref="colorBorder" :spellcheck="false" :value="(toHex(b.border.color)).slice(1)"
                        @change="e => onColorChange(e, idx)" @focus="selectColor(idx)" />
                    <input ref="alphaBorder" style="text-align: center;"
                        :value="filterAlpha(b.border.color.alpha * 100) + '%'" @change="e => onAlphaChange(e, idx)"
                        @focus="selectAlpha(idx)" />
                </div>
                <div class="extra-action">
                    <BorderDetail :context="props.context" :shapes="props.shapes" :border="b.border"
                        :index="borders.length - idx - 1">
                    </BorderDetail>
                    <div class="delete" @click="deleteBorder(idx)">
                        <svg-icon icon-class="delete"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.border-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;

    .add {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: .2s;

        >svg {
            width: 50%;
            height: 50%;
        }
    }

    .add:hover {
        transform: scale(1.25);
    }

    .tips-wrap {
        padding: 12px 0;

        .mixed-tips {
            display: block;
            width: 100%;
            text-align: center;
            font-size: var(--font-default-fontsize);
        }
    }

    .borders-container {
        .border {
            height: 30px;
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-top: 4px;

            .visibility {
                flex: 0 0 18px;
                height: 18px;
                width: 18px;
                background-color: var(--active-color);
                border-radius: 3px;
                border: 1px solid var(--input-background);
                box-sizing: border-box;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;

                >svg {
                    width: 60%;
                    height: 60%;
                }
            }

            .hidden {
                flex: 0 0 18px;
                height: 18px;
                background-color: transparent;
                border-radius: 3px;
                border: 1px solid var(--input-background);
                box-sizing: border-box;
            }

            .color {
                flex: 0 1 140px;
                background-color: var(--input-background);
                height: 100%;
                padding: 0px 5px;
                margin-left: 5px;
                border-radius: 3px;
                box-sizing: border-box;
                display: flex;
                align-items: center;

                input {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 85px;
                    margin-left: 5px;
                }

                input+input {
                    width: 45px;
                }
            }

            .extra-action {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 9px;

                .delete {
                    flex: 0 0 16px;
                    display: flex;
                    align-items: center;
                    justify-content: left;
                    width: 17px;
                    height: 22px;
                    transition: 0.2s;

                    >svg {
                        width: 11px;
                        height: 11px;
                    }
                }

                .delete:hover {
                    color: #ff5555;
                }
            }
        }
    }
}
</style>