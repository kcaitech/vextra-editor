<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import { Context } from '@/context';
import { Color, Fill, Shape, FillType, ShapeType, TableShape } from "@kcdesign/data";
import { Reg_HEX } from "@/utils/RegExp";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { message } from "@/utils/message";
import { Selection } from '@/context/selection';
import { get_fills, get_actions_fill_color, get_actions_add_fill, get_actions_fill_unify, get_actions_fill_enabled, get_actions_fill_delete } from '@/utils/shape_style';
import { v4 } from 'uuid';

interface FillItem {
    id: number,
    fill: Fill
}
interface Props {
    context: Context
    shapes: Shape[]
}
const props = defineProps<Props>();
const editor = computed(() => props.context.editor4Shape(props.shapes[0]));
const len = computed<number>(() => props.shapes.length);
const { t } = useI18n();
const watchedShapes = new Map();
const fills: FillItem[] = reactive([]);
const alphaFill = ref<any>();
const colorFill = ref<any>();
const mixed = ref<boolean>(false);
function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
}
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
function updateData() {
    fills.length = 0;
    mixed.value = false;
    if (props.shapes.length === 1) {
        const shape = props.shapes[0];
        const style = shape.style;
        for (let i = 0, len = style.fills.length; i < len; i++) {
            const fill = style.fills[i];
            const f = { id: i, fill };
            fills.unshift(f);
        }
    } else if (props.shapes.length > 1) {
        const _fs = get_fills(props.shapes);
        if (_fs === 'mixed') {
            mixed.value = true;
        } else {
            fills.unshift(..._fs);
        }
    }
}
function watcher(...args: any[]) {
    if (args.length > 0 && args.includes('style')) updateData();
}
function addFill(): void {
    const color = new Color(0.2, 0, 0, 0);
    const fill = new Fill(v4(), true, FillType.SolidColor, color);
    if (len.value === 1) {
        const s = props.context.selection.selectedShapes[0];
        const e = props.context.editor4Shape(s);
        if (s.type === ShapeType.Table) {
            const table = props.context.selection.getTableSelection(s as TableShape, props.context);
            const editor = props.context.editor4Table(s as TableShape);
            if (table.tableRowStart > -1 || table.tableColStart > -1) {
                console.log(table, 'table');
                editor.addFill(fill, { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd })
            } else {
                console.log(fill, 'fill');
                e.addFill(fill);
            }
        } else {
            e.addFill(fill);
        }
    } else if (len.value > 1) {
        if (mixed.value) {
            const actions = get_actions_fill_unify(props.shapes);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesFillsUnify(actions);
            }
        } else {
            const actions = get_actions_add_fill(props.shapes, fill);
            const page = props.context.selection.selectedPage;
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.shapesAddFill(actions);
            }
        }
    }
}
function first() {
    if (fills.length === 0 && !mixed.value) addFill();
}
function deleteFill(idx: number) {
    const _idx = fills.length - idx - 1;
    if (len.value === 1) {
        const s = props.context.selection.selectedShapes[0];
        if (s.type === ShapeType.Table) {
            const table = props.context.selection.getTableSelection(s as TableShape, props.context);
            const e = props.context.editor4Table(s as TableShape);
            if (table.tableRowStart > -1 || table.tableColStart > -1) {
                console.log(table, 'table');
                e.deleteFill(_idx, { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd })
            } else {
                editor.value.deleteFill(_idx);
            }
        } else {
            editor.value.deleteFill(_idx);
        }
    } else if (len.value > 1) {
        const actions = get_actions_fill_delete(props.shapes, _idx);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.shapesDeleteFill(actions);
        }
    }
}
function toggleVisible(idx: number) {
    const _idx = fills.length - idx - 1;
    if (len.value === 1) {
        const s = props.context.selection.selectedShapes[0];
        if (s.type === ShapeType.Table) {
            const table = props.context.selection.getTableSelection(s as TableShape, props.context);
            const e = props.context.editor4Table(s as TableShape);
            if (table.tableRowStart > -1 || table.tableColStart > -1) {
                console.log(table, 'table');
                e.setFillEnable(_idx, !fills[idx].fill.isEnabled, { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd })
            } else {
                editor.value.setFillEnable(_idx, !fills[idx].fill.isEnabled);
            }
        } else {
            editor.value.setFillEnable(_idx, !fills[idx].fill.isEnabled);
        }
    } else if (len.value > 1) {
        const value = !props.shapes[0].style.fills[idx].isEnabled;
        const actions = get_actions_fill_enabled(props.shapes, _idx, value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillEnabled(actions);
        }
    }
}
function setColor(idx: number, clr: string, alpha: number) {
    const res = clr.match(Reg_HEX);
    if (!res) {
        message('danger', t('system.illegal_input'));
        return;
    }
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const _idx = fills.length - idx - 1;
    if (len.value === 1) {
        const s = props.context.selection.selectedShapes[0];
        if (s.type === ShapeType.Table) {
            const table = props.context.selection.getTableSelection(s as TableShape, props.context);
            const e = props.context.editor4Table(s as TableShape);
            if (table.tableRowStart > -1 || table.tableColStart > -1) {
                console.log(table, 'table');
                e.setFillColor(_idx, new Color(alpha, r, g, b), { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd })
            } else {
                editor.value.setFillColor(_idx, new Color(alpha, r, g, b));
            }
        } else {
            editor.value.setFillColor(_idx, new Color(alpha, r, g, b));
        }
    } else if (len.value > 1) {
        const actions = get_actions_fill_color(props.shapes, _idx, new Color(alpha, r, g, b));
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    }
}
function onColorChange(idx: number, e: Event) {
    let value = (e.target as HTMLInputElement)?.value;
    if (value.slice(0, 1) !== '#') {
        value = "#" + value
    }
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (Reg_HEX.test(value)) {
        const alpha = fills[idx].fill.color.alpha;
        setColor(idx, value, alpha);
    } else {
        message('danger', t('system.illegal_input'));
        return (e.target as HTMLInputElement).value = toHex(fills[idx].fill.color.red, fills[idx].fill.color.green, fills[idx].fill.color.blue);
    }
}
function onAlphaChange(idx: number, e: Event) {
    let value = (e.currentTarget as any)['value'];
    if (alphaFill.value) {
        if (value?.slice(-1) === '%') {
            value = Number(value?.slice(0, -1))
            if (value >= 0) {
                if (value > 100) {
                    value = 100
                }
                value = value.toFixed(2) / 100
                const color = fills[idx].fill.color;
                let clr = toHex(color.red, color.green, color.blue);
                if (clr.slice(0, 1) !== '#') {
                    clr = "#" + clr
                }
                setColor(idx, clr, value);
                return
            } else {
                message('danger', t('system.illegal_input'));
                return (e.target as HTMLInputElement).value = (fills[idx].fill.color.alpha * 100) + '%'
            }
        } else if (!isNaN(Number(value))) {
            if (value >= 0) {
                if (value > 100) {
                    value = 100
                }
                value = Number((Number(value)).toFixed(2)) / 100
                const color = fills[idx].fill.color;
                let clr = toHex(color.red, color.green, color.blue);
                if (clr.slice(0, 1) !== '#') {
                    clr = "#" + clr
                }
                setColor(idx, clr, value);
                return
            } else {
                message('danger', t('system.illegal_input'));
                return (e.target as HTMLInputElement).value = (fills[idx].fill.color.alpha * 100) + '%'
            }
        } else {
            message('danger', t('system.illegal_input'));
            return (e.target as HTMLInputElement).value = (fills[idx].fill.color.alpha * 100) + '%'
        }
    }
}
function getColorFromPicker(idx: number, color: Color) {
    const _idx = fills.length - idx - 1;
    if (len.value === 1) {
        const s = props.context.selection.selectedShapes[0];
        if (s.type === ShapeType.Table) {
            const table = props.context.selection.getTableSelection(s as TableShape, props.context);
            const e = props.context.editor4Table(s as TableShape);
            if (table.tableRowStart > -1 || table.tableColStart > -1) {
                console.log(table, 'table');
                e.setFillColor(_idx, color, { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd })
            } else {
                editor.value.setFillColor(_idx, color);
            }
        } else {
            editor.value.setFillColor(_idx, color);
        }
    } else if (len.value > 1) {
        const actions = get_actions_fill_color(props.shapes, _idx, color);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesFillColor(actions);
        }
    }
}

const selectColor = (id: number) => {
    if (colorFill.value) {
        colorFill.value[id].select()
    }
}
const selectAlpha = (id: number) => {
    if (alphaFill.value) {
        alphaFill.value[id].select()
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
function update_by_shapes() {
    watchShapes();
    updateData();
}
// hooks
const stop = watch(() => props.shapes, update_by_shapes);
onMounted(() => {
    update_by_shapes();
})
onUnmounted(() => {
    stop();
})
</script>

<template>
    <div class="fill-panel">
        <TypeHeader :title="t('attr.fill')" class="mt-24" @click="first">
            <template #tool>
                <div class="add" @click="addFill">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </template>
        </TypeHeader>
        <div class="tips-wrap" v-if="mixed">
            <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
        </div>
        <div class="fills-container" v-else-if="!mixed">
            <div class="fill" v-for="(f, idx) in fills" :key="f.id">
                <div :class="f.fill.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                    <svg-icon v-if="f.fill.isEnabled" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <ColorPicker :color="f.fill.color" :context="props.context" @change="c => getColorFromPicker(idx, c)">
                    </ColorPicker>
                    <input ref="colorFill" :value="toHex(f.fill.color.red, f.fill.color.green, f.fill.color.blue)"
                        :spellcheck="false" @change="(e) => onColorChange(idx, e)" @focus="selectColor(idx)" />
                    <input ref="alphaFill" style="text-align: center;" :value="filterAlpha(f.fill.color.alpha * 100) + '%'"
                        @change="(e) => onAlphaChange(idx, e)" @focus="selectAlpha(idx)" />
                </div>
                <div style="width: 22px;"></div>
                <div class="delete" @click="deleteFill(idx)">
                    <svg-icon icon-class="delete"></svg-icon>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped lang="scss">
.fill-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px 10px 12px 10px;
    box-sizing: border-box;

    .add {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;

        >svg {
            width: 50%;
            height: 50%;
        }

        transition: .2s;
    }

    .add:hover {
        transform: scale(1.25);
    }

    .fills-container {
        .fill {
            height: 30px;
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-top: 4px;

            .visibility {
                flex: 0 0 18px;
                width: 18px;
                height: 18px;
                background-color: var(--active-color);
                border-radius: var(--default-radius);
                border: 1px solid #d8d8d8;
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
                width: 18px;
                height: 18px;
                background-color: transparent;
                border-radius: var(--default-radius);
                border: 1px solid #d8d8d8;
                box-sizing: border-box;
            }

            .color {
                background-color: rgba(#D8D8D8, 0.4);
                height: 100%;
                padding: 0px 5px;
                margin-left: 5px;
                border-radius: var(--default-radius);
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

            .delete {
                flex: 0 0 22px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 22px;
                height: 22px;

                >svg {
                    width: 11px;
                    height: 11px;
                }

                transition: .2s;
            }

            .delete:hover {
                color: #ff5555;
            }
        }
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

}
</style>