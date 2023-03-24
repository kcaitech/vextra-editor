<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-03 14:52:04
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 17:58:48
-->
<script setup lang="ts">
import { computed, defineProps, onBeforeUpdate, onMounted, onUnmounted, reactive } from 'vue';
import { Context } from '@/context';
import { Shape } from '@kcdesign/data/data/shape';
import TypeHeader from './TypeHeader.vue';
import BorderDetail from './PopoverMenu/BorderDetail.vue';
import ColorPicker from './PopoverMenu/ColorPicker.vue';
import { useI18n } from 'vue-i18n';
import { Color, Border, ContextSettings, BorderStyle, MarkerType } from '@kcdesign/data/data/style';
import { FillType, BlendMode, BorderPosition } from '@kcdesign/data/data/classes';
import { Reg_HEX } from "@/utils/RegExp";
import { message } from "@/utils/message";
import { toHex } from "@/utils/color"

interface BorderItem {
    id: number,
    border: Border
}

const { t } = useI18n();
const props = defineProps<{
    context: Context,
    shape: Shape,
}>();
const data: { borders: BorderItem[] } = reactive({ borders: [] });
const { borders } = data;
const editor = computed(() => {
    return props.context.editor4Shape(props.shape);
});
let shapeId: string = "";
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
function watcher(...args: any[]) {    
    if (args.length > 0 && args.includes('style')) updateData();
}
function updateData() {    
    shapeId = props.shape.id;
    borders.length = 0;
    const style = props.shape.style;
    for (let i = 0, len = style.borders.length; i < len; i++) {
        const border = style.borders[i];
        const b: BorderItem = {
            id: i,
            border: border
        }
        borders.push(b);
    }
}
function addBorder() {
    const color = new Color(1, 0, 0, 0);
    const contextSettings = new ContextSettings(BlendMode.Normal, 1);
    const borderStyle = new BorderStyle(0, 0);
    const border = new Border(true, FillType.SolidColor, color, contextSettings, BorderPosition.Outer, 1, borderStyle, MarkerType.Line, MarkerType.Line);
    editor.value.addBorder(border);
}
function deleteBorder(idx: number) {
    editor.value.deleteBorder(idx);
}
function toggleVisible(idx: number) {
    const border = borders[idx].border;
    const isEnabled = !border.isEnabled;
    const color = border.color;
    setBorder(idx, { isEnabled, color: color });
}
function onColorChange(e: Event, idx: number) {
    let value = (e.target as HTMLInputElement)?.value;
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    const hex = value.match(Reg_HEX);
    const border = borders[idx].border;
    if (!hex) {
        message('danger', t('system.illegal_input'));
        return;
    }
    
    const r = Number.parseInt(hex[1], 16);
    const g = Number.parseInt(hex[2], 16);
    const b = Number.parseInt(hex[3], 16);
    const alpha = border.color.alpha;
    const color = new Color(alpha, r, g, b);
    const isEnabled = border.isEnabled;
    setBorder(idx, { isEnabled, color });
}
function onAlphaChange(e: Event, idx: number) {
    const alpha = Number(Number.parseFloat((e.target as HTMLInputElement).value).toFixed(2));
    if (isNaN(alpha) || alpha < 0 || alpha > 1) {
        message('danger', t('system.illegal_input'));
        return;
    }
    const border = borders[idx].border;
    const color = border.color;
    color.alpha = alpha;
    const isEnabled = border.isEnabled;
    setBorder(idx, { isEnabled, color });
}
function setBorder(idx: number,  options: { color: Color, isEnabled: boolean }) {
    editor.value.setBorder(idx, options);
}
function onBorderMouseDown() {}
// hooks
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
    <div class="border-panel">
        <TypeHeader :title="t('attr.border')" class="mt-24">
            <template #tool>
                <div class="add" @click="addBorder">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </template>
        </TypeHeader>
        <div class="borders-container">
            <div class="border" v-for="(b, idx) in borders" :key="b.id" @mousedown.stop="onBorderMouseDown()">
                <div :class="b.border.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible(idx)">
                    <svg-icon v-if="b.border.isEnabled" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <ColorPicker :color="b.border.color"/>
                    <input
                        :spellcheck ="false"
                        :value="toHex(b.border.color)"
                        @change="e => onColorChange(e, idx)"
                    />
                    <input
                        style="text-align: center;"
                        :value="b.border.color.alpha"
                        @change="e => onAlphaChange(e, idx)"
                    />
                </div>
                <div class="extra-action">
                    <BorderDetail :context="props.context" :shape="props.shape" :border="b.border"></BorderDetail>
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
    padding: 12px 24px;
    box-sizing: border-box;
    .add {
        width: 16px;
        height: 16px;
        transition: .2s;
        > svg {
            width: 80%;
            height: 80%;
        }
    }
    .add:hover {
        transform: scale(1.25);
    }
    .borders-container {
        .border {
            height: 32px;
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-top: 4px;
            .visibility {
                flex: 0 0 16px;
                height: 16px;
                background-color: #2561D9;
                border-radius: 3px;
                border: 1px solid var(--input-background);
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
                flex: 0 0 16px;
                height: 16px;
                background-color: transparent;
                border-radius: 3px;
                border: 1px solid var(--input-background);
                box-sizing: border-box;
            }
            .color {
                flex: 0 1 140px;
                background-color: var(--input-background);
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
                    width: 68px;
                    margin-left: 10px;
                }
                input + input {
                    width: 30px;
                }
            }
            .extra-action {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                .delete {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    transition: 0.2s;
                    > svg {
                        width: 80%;
                        height: 80%;
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