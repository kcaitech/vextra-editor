<template>
    <div class="new-style" :style="{ top: props.top + 'px', left: props.left + 'px' }">
        <div class="header">
            <div class="title">创建边框样式</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input v-focus type="text" id="name" v-model="name" @keydown.esc="props.context.escstack.execute()">
            </div>
            <div class="des">
                <label for="des">描述</label>
                <input type="text" id="des" v-model="des">
            </div>
        </div>
        <div class="border">
            <div class="type">
                <div class="title">位置</div>
                <Select class="select" :context="props.context" :shapes="props.shapes" :source="positonOptionsSource"
                    :selected="positonOptionsSource.find(i => i.data.value === borderData.position)?.data"
                    @select="positionSelect"></Select>
            </div>
            <div class="thickness">
                <div class="title">粗细</div>
                <input type="text" v-model="thickness" @change="setThickness">
            </div>
        </div>
        <div class="create-bnt" @click.stop="Newborder">创建样式</div>
    </div>

</template>
<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BorderPosition, ShapeType, SideType, TableCellView, PathShapeView, StrokePaint, CornerType, BorderStyle, BorderSideSetting, BorderMaskType, BorderMask, BasicArray } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, genOptions } from '@/utils/common';
import { is_editing } from '@/utils/content';
import { flattenShapes } from '@/utils/cutout';
import { get_actions_border_position, get_borders } from '@/utils/shape_style';
import { Selection } from "@/context/selection";
import { getShapesForStyle } from '@/utils/style';
import { v4 } from 'uuid';

interface StrokePaintItem {
    id: number
    strokePaint: StrokePaint
}
interface BorderData {
    position: BorderPosition | string
    cornerType: CornerType | string
    borderStyle: BorderStyle | string
    sideSetting: BorderSideSetting | string,
}

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    top: number;
    left: number
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const position = ref<SelectItem>({ value: 0, content: t('attr.center') });
const initBorder = {
    position: BorderPosition.Center,
    cornerType: CornerType.Miter,
    borderStyle: new BorderStyle(0, 0),
    sideSetting: new BorderSideSetting(SideType.Normal, 1, 1, 1, 1)
}
const borderData = ref<BorderData>({ ...initBorder })
const data: { strokePaints: StrokePaintItem[] } = reactive({
    strokePaints: [],
});
const { strokePaints } = data;
const watchedShapes = new Map();
const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);
const reflush_side = ref(0);
const reflush_apex = ref(0);
const show_apex = ref<boolean>(false);
const mixed = ref<boolean>(false);
const mixed_cell = ref(false);
const hasStroke = ref(false);
const positonvalue = ref<BorderPosition>(BorderPosition.Center)
const thickness = ref<string>('')
const oldvalue = ref<string>('')
const name = ref<string>('name')
const des = ref<string>('des')

const setThickness = () => {
    let arrs = thickness.value.replaceAll(/，/g, ',').replaceAll(/\s+/g, '').split(',').slice(0, 4).filter(Boolean);
    const b = arrs.every(i => isNaN(Number(i)) === false)
    if (!b) return thickness.value = oldvalue.value;
    if (arrs.length === 1) {
        arrs = arrs.concat(...arrs, ...arrs, ...arrs)
    }
    if (arrs.length === 2) {
        arrs = arrs.concat(arrs[0], arrs[1])
    }
    if (arrs.length === 3) {
        arrs = arrs.concat(arrs[1])
    }
    thickness.value = arrs.join(', ')
}

function positionSelect(selected: SelectItem, id: number | undefined) {
    positonvalue.value = selected.value as BorderPosition;
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    const shapes = getShapesForStyle(selecteds);
    const actions = get_actions_border_position(shapes, id!, selected.value as BorderPosition);
    if (actions && actions.length) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderPosition(actions);
    }
}

const Newborder = () => {
    const editor = props.context.editor4Doc()
    if (!thickness.value && !positonvalue.value) return
    const value = thickness.value.split(', ').map(i => Number(i))
    const side = new BorderSideSetting(SideType.Normal, value[0], value[3], value[2], value[1])
    const border = new BorderMaskType(positonvalue.value, side)
    const style = new BorderMask(new BasicArray(), props.context.data.id, v4(), name.value, des.value, border)
    const page = props.context.selection.selectedPage!
    const selected = props.context.selection.selectedShapes;
    const shapes = getShapesForStyle(selected);
    editor.insertStyleLib(style, page, shapes);
    emits('close')
    props.context.escstack.execute()
}

function watchShapes() {
    const needWatchShapes = new Map();
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        for (let i = 0, l = selectedShapes.length; i < l; i++) {
            const v = selectedShapes[i];
            if (v.isVirtualShape) {
                let p = v.parent;
                while (p) {
                    if (p.type === ShapeType.SymbolRef) {
                        needWatchShapes.set(p.id, p);
                        break;
                    }
                    p = p.parent;
                }
            }
            needWatchShapes.set(v.id, v);
        }
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
    if ((args.includes('layout') || args.includes('borders'))) {
        updateData();
    }
    if (args.includes('pathsegs') && args.includes('points')) {
        layout();
        reflush_apex.value++;
    }
}

function updateData() {
    mixed.value = false;
    mixed_cell.value = false;
    hasStroke.value = false;
    const selecteds = props.context.selection.selectedShapes;
    if (selecteds.length < 1) return;
    strokePaints.length = 0;
    borderData.value = initBorder;
    const shape = selecteds[0];
    const table = props.context.tableSelection;
    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
        const is_edting = table.editingCell;
        let cells: TableCellView[] = [], might_is_mixed = false;
        if (table.tableRowStart > -1) {
            const _cs = table.getSelectedCells(true);
            for (let i = 0, len = _cs.length; i < len; i++) {
                const c = _cs[i];
                if (!c.cell) might_is_mixed = true;
                else cells.push(c.cell);
            }
        } else if (is_edting) {
            cells.push(is_edting)
        }
        if (cells.length > 0) {
            const { border, stroke_paints } = get_borders(cells);
            if (stroke_paints === 'mixed') {
                mixed_cell.value = true;
                hasStroke.value = true;
            } else {
                if (stroke_paints.length > 0 && might_is_mixed) {
                    mixed_cell.value = true;
                    hasStroke.value = true;
                } else {
                    strokePaints.push(...stroke_paints.reverse());
                    if (stroke_paints.length) hasStroke.value = true;
                }
            }
            borderData.value = border;
        }
    } else {
        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group);
        const { border, stroke_paints } = get_borders(shapes);
        if (stroke_paints === 'mixed') {
            mixed.value = true;
            hasStroke.value = true;
        } else {
            strokePaints.push(...stroke_paints.reverse());
            if (stroke_paints.length) hasStroke.value = true;
        }
        borderData.value = border;
    }
    const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = borderData.value.sideSetting as BorderSideSetting;
    thickness.value =[thicknessTop,thicknessRight,thicknessBottom,thicknessLeft].join(', ');
    oldvalue.value = thickness.value;
    reflush_side.value++
}

function layout() {
    show_apex.value = false;
    const shapes = flattenShapes(props.shapes).filter(s => s.type !== ShapeType.Group);

    show_apex.value = line_end_point(shapes);
}

const line_end_point = (shapes: ShapeView[]) => {
    const segment = shapes.every(v => ((v instanceof PathShapeView) && ((v.segments.length === 1 && !v.segments[0].isClosed) || v.segments.length > 1)));
    const endpoint = shapes.every(v => (v.type === ShapeType.Line || v.type === ShapeType.Contact || segment));
    return endpoint;
}

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) update_by_shapes();
}

function update_by_shapes() {
    watchShapes();
    updateData();
    layout();
}

onMounted(() => {
    update_by_shapes();
    // props.context.tableSelection.watch(table_selection_watcher);
    props.context.selection.watch(selection_watcher);
})

onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    watchedShapes.forEach(v => {
        v.unwatch(watcher)
    });
})

</script>
<style lang="scss" scoped>
.new-style {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid #f0f0f0;
        box-sizing: border-box;

        .close {
            width: 28px;
            height: 28px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            svg {
                width: 16px;
                height: 16px;
                margin: auto;
                padding: 2px;
                /* margin-top: 1px; */
                box-sizing: border-box;
            }
        }
    }

    .detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .name,
        .des {
            display: flex;
            align-items: center;
            height: 32px;
            gap: 8px;

            input {
                flex: 1;
                outline: none;
                font-size: 12px;
                padding: 10px 8px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid transparent;
                background-color: #F5F5F5;
                box-sizing: border-box;

                &:focus {
                    border: 1px solid #1878f5;
                }
            }
        }
    }

    .border {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        margin-bottom: 8px;
        box-sizing: border-box;

        .type {
            display: flex;
            gap: 8px;
            align-items: center;

            .title {}

            .select {
                flex: 1;
            }
        }

        .thickness {

            display: flex;
            align-items: center;
            gap: 8px;
            box-sizing: border-box;

            .title {}

            input {
                flex: 1;
                width: 100%;
                outline: none;
                border: none;
                padding: 10px 8px;
                background-color: #F5F5F5;
                height: 32px;
                border-radius: 6px;
                box-sizing: border-box;
            }
        }
    }

    .create-bnt {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto;
        margin-bottom: 12px;
        font-size: 12px;
        width: 100px;
        height: 40px;
        border-radius: 6px;
        background-color: #1878f5;
        color: #fff;

        &:hover {
            background-color: #429AFF;
        }

        &:active {
            background-color: #0A59CF;
        }
    }
}
</style>
