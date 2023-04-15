<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-03 14:52:04
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 17:44:28
 * @FilePath: \kcdesign\src\components\Document\Attribute\TypeHeader.vue
-->
<script setup lang="ts">
import { computed, defineProps, onBeforeUpdate, onMounted, onUnmounted, onUpdated, reactive, ref, nextTick } from 'vue';
import { Context } from '@/context';
import { Shape } from '@kcdesign/data/data/shape';
import { Color, Fill, ContextSettings } from "@kcdesign/data/data/style";
import { FillType, BlendMode } from '@kcdesign/data/data/classes';
import { Reg_HEX } from "@/utils/RegExp";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import ColorPicker from '@/components/common/ColorPicker.vue';
import { message } from "@/utils/message";

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
const showFill = ref<boolean>(false)

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return "#" + hex(r) + hex(g) + hex(b);
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
    const fill = new Fill(true, FillType.SolidColor, color, contextSettings);
    editor.value.addFill(fill);
}

function deleteFill(idx: number) {
    editor.value.deleteFill(idx);
}

function toggleVisible(idx: number) {
    editor.value.setFillEnable(idx);
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
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (Reg_HEX.test(value)) {
        const alpha = fills[idx].fill.color.alpha;
        setColor(idx, value, alpha);
    } else {
        message('danger', t('system.illegal_input'));
    }
}

function onAlphaChange(idx: number, e: Event) {
    let value = Number(Number.parseFloat((e.target as HTMLInputElement)?.value).toFixed(2));
    if (value >= 0 && value <= 1) {
        const color = fills[idx].fill.color;
        const clr = toHex(color.red, color.green, color.blue);
        setColor(idx, clr, value);
    } else {
        message('danger', t('system.illegal_input'));
    }
}
function getColorFromPicker(rgb: number[], idx: number) {
    const clr = toHex(rgb[0], rgb[1], rgb[2]);
    const alpha = fills[idx].fill.color.alpha;
    setColor(idx, clr, alpha);
}

const fillArr = ['line-shape']

// hooks
onUpdated(() => {
    if(fillArr.includes(props.shape.typeId)) {
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
        <TypeHeader :title="t('attr.fill')" class="mt-24">
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
                    <ColorPicker :color="f.fill.color" @choosecolor="c => getColorFromPicker(c, idx)"></ColorPicker>
                    <input
                        :value="toHex(f.fill.color.red, f.fill.color.green, f.fill.color.blue)"
                        :spellcheck ="false"
                        @change="(e) => onColorChange(idx, e)"
                    />
                    <input
                        style="text-align: center;"
                        :value="f.fill.color.alpha"
                        @change="(e) => onAlphaChange(idx, e)"
                    />
                </div>
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
    padding: 12px 24px;
    box-sizing: border-box;
    .add {
        width: 16px;
        height: 16px;
        > svg {
            width: 80%;
            height: 80%;
        }
        transition: .2s;
    }
    .add:hover {
        transform: scale(1.25);
    }
    .fills-container {
        .fill {
            height: 32px;
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-top: 4px;
            .visibility {
                width: 16px;
                height: 16px;
                background-color: #2561D9;
                border-radius: 3px;
                border: 1px solid #d8d8d8;
                box-sizing: border-box;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;
                > svg {
                    width: 80%;
                    height: 80%;
                }
            }
            .hidden {
                width: 16px;
                height: 16px;
                background-color: transparent;
                border-radius: 3px;
                border: 1px solid #d8d8d8;
                box-sizing: border-box;
            }
            .color {
                background-color: rgba(#D8D8D8, 0.4);
                height: 100%;
                padding: 2px 8px;
                margin-left: 12px;
                border-radius: 3px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                input {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 92px;
                    margin-left: 10px;
                }
                input + input {
                    width: 30px;
                }
            }
            .delete {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 16px;
                height: 16px;
                margin-left: 32px;
                padding: 0 var(--default-padding-half);
                > svg {
                    width: 80%;
                    height: 80%;
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