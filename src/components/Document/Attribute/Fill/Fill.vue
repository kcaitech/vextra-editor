<script setup lang="ts">
import { computed, defineProps, onBeforeUpdate, onMounted, onUnmounted, onUpdated, reactive, ref } from 'vue';
import { Context } from '@/context';
import { Shape } from '@kcdesign/data';
import { Color, Fill, ContextSettings } from "@kcdesign/data";
import { FillType, BlendMode } from '@kcdesign/data';
import { Reg_HEX } from "@/utils/RegExp";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { message } from "@/utils/message";
import { v4 as uuid } from "uuid";
interface FillItem {
    id: number,
    fill: Fill
}

const { t } = useI18n();
const props = defineProps<{
    context: Context,
    shape: Shape,
}>();

const editor = computed(() => {
    return props.context.editor4Shape(props.shape);
})

const fills: FillItem[] = reactive([]);
const alpheFill = ref<HTMLInputElement>()
function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
}

let shapeId: string = "";
function updateData() {
    shapeId = props.shape.id;
    fills.length = 0;
    const style = props.shape.style;
    for (let i = 0, len = style.fills.length; i < len; i++) {
        const fill = style.fills[i];
        const f = { id: i, fill };
        fills.push(f);
    }
}

function watcher(...args: any[]) {
    if (args.length > 0 && args.includes('style')) updateData();
}

let shape: Shape | undefined;
function setupWatcher() {
    if (!shape) {
        shape = props.shape;
        shape.watch(watcher);
    }
    else if (shape.id != props.shape.id) {
        shape.unwatch(watcher);
        shape = props.shape;
        shape.watch(watcher);
    }
}

function addFill(): void {
    const color = new Color(0.2, 0, 0, 0);
    const contextSettings = new ContextSettings(BlendMode.Normal, 1);
    const fill = new Fill(uuid(), true, FillType.SolidColor, color, contextSettings);
    editor.value.addFill(fill);
}
const isNoFile = () => {
    if (fills.length === 0) {
        addFill()
    }
}

function deleteFill(idx: number) {
    editor.value.deleteFill(idx);
}

function toggleVisible(idx: number) {
    editor.value.toggleFillEnable(idx);
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
    editor.value.setFillColor(idx, new Color(alpha, r, g, b))
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
        return (e.target as HTMLInputElement).value = toHex(fills[idx].fill.color.red, fills[idx].fill.color.green, fills[idx].fill.color.blue)
    }
}

function onAlphaChange(idx: number, e: Event) {
    let value = (e.currentTarget as any)['value']
    if (alpheFill.value) {
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
function getColorFromPicker(rgb: number[], idx: number) {
    let clr = toHex(rgb[0], rgb[1], rgb[2]);
    if (clr.slice(0, 1) !== '#') {
        clr = "#" + clr
    }
    const alpha = fills[idx].fill.color.alpha;
    setColor(idx, clr, alpha);
}

const fillArr = ['line-shape']

// hooks
onUpdated(() => {
    if (fillArr.includes(props.shape.typeId)) {
        deleteFill(0)
    }
})

onMounted(() => {
    updateData();
    setupWatcher();
})

onUnmounted(() => {
    if (shape) {
        shape.unwatch(watcher);
        shape = undefined;
    }
})
onBeforeUpdate(() => {
    if (shapeId != props.shape.id) updateData();
    setupWatcher();
})

</script>

<template>
    <div class="fill-panel">
        <TypeHeader :title="t('attr.fill')" class="mt-24" @click="isNoFile">
            <template #tool>
                <div class="add" @click="addFill">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </template>
        </TypeHeader>
        <div class="fills-container">
            <div class="fill" v-for="(f, idx) in fills" :key="f.id">
                <div :class="f.fill.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(f.id)">
                    <svg-icon v-if="f.fill.isEnabled" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <ColorPicker :color="f.fill.color" :context="props.context"
                        @choosecolor="c => getColorFromPicker(c, idx)"></ColorPicker>
                    <input :value="toHex(f.fill.color.red, f.fill.color.green, f.fill.color.blue)" :spellcheck="false"
                        @change="(e) => onColorChange(idx, e)" />
                    <input ref="alpheFill" style="text-align: center;" :value="(f.fill.color.alpha * 100) + '%'"
                        @change="(e) => onAlphaChange(idx, e)" />
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
    padding: 12px 10px;
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
                background-color: #2561D9;
                border-radius: 3px;
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
                border-radius: 3px;
                border: 1px solid #d8d8d8;
                box-sizing: border-box;
            }

            .color {
                background-color: rgba(#D8D8D8, 0.4);
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
}
</style>