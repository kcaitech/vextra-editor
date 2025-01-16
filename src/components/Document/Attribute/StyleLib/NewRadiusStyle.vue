<template>
    <div id="create-radius-panel" class="new-style">
        <div class="header">
            <div class="title">{{ t('stylelib.create_radius') }}</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">{{ t('stylelib.name') }}</label>
                <input v-focus type="text" id="name" v-model="name" @keydown.esc="props.context.escstack.execute()">
            </div>
            <div class="des">
                <label for="des">{{ t('stylelib.description') }}</label>
                <input type="text" id="des" v-model="des">
            </div>
        </div>
        <div class="radius">
            <div class="title">{{ t('stylelib.round') }}</div>
            <input type="text" v-model="radius" @change="setRadius">
        </div>

        <div class="create-bnt" @click.stop="emits('close')">{{ t('stylelib.add_style') }}</div>
    </div>

</template>
<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BorderPosition, ShapeType, Border, TableCellView, PathShapeView, BasicArray } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, genOptions } from '@/utils/common';
import { is_editing } from '@/utils/content';
import { flattenShapes } from '@/utils/cutout';
import { get_actions_border_position, get_borders } from '@/utils/shape_style';
import { Selection } from "@/context/selection";
import { getShapesForStyle } from '@/utils/style';
import { v4 } from 'uuid';

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const watchedShapes = new Map();
const radius = ref<string>('')
const oldvalue = ref<string>('')
const name = ref<string>('name')
const des = ref<string>('des')

const setRadius = () => {
    let arrs = radius.value.replaceAll(/，/g, ',').replaceAll(/\s+/g, '').split(',').slice(0, 4).filter(Boolean);
    const b = arrs.every(i => isNaN(Number(i)) === false)
    console.log(b);
    if (!b) return radius.value = oldvalue.value;
    console.log(b);
    if (arrs.length === 1) {
        arrs = arrs.concat(...arrs, ...arrs, ...arrs)
    }
    if (arrs.length === 2) {
        arrs = arrs.concat('0', '0')
    }
    if (arrs.length === 3) {
        arrs = arrs.concat('0')
    }
    radius.value = arrs.join(', ')
    oldvalue.value = radius.value
    const editor=props.context.editor4Doc()
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
}

function updateData() {
    const selecteds = props.context.selection.selectedShapes;
    if (selecteds.length < 1) return;
}





function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) update_by_shapes();
}

function update_by_shapes() {
    watchShapes();
    updateData();
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

    .radius {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .title {}

        input {
            flex: 1;
            width: 100%;
            outline: none;
            border: none;
            padding: 10px 8px;
            background-color: #F5F5F5;
            border: 1px solid transparent;
            height: 32px;
            border-radius: 6px;
            box-sizing: border-box;

            &:focus {
                border: 1px solid #1878f5;
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
