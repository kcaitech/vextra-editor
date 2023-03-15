<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-03 14:52:04
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 17:44:28
 * @FilePath: \kcdesign\src\components\Document\Attribute\TypeHeader.vue
-->
<script setup lang="ts">
import { computed, defineProps, onBeforeUpdate, onMounted, onUnmounted, reactive } from 'vue';
import { Context } from '@/context';
import { Shape } from '@/data/data/shape';
import { Color } from "@/data/data/style";
import { Reg_HEX } from "@/utils/RegExp"
import TypeHeader from './TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import ColorPicker from './PopoverMenu/ColorPicker.vue';
import { message } from "@/utils/message";
const { t } = useI18n();
const props = defineProps<{
    context: Context,
    shape: Shape,
}>();
type  Fill = {
    id: number,
    color: string,
    opacity: number,
    visibility: boolean
}

const editor = computed(() => {
    return props.context.editor4Shape(props.shape);
})

const data = reactive<Fill[]>([])

function toHexRgb(r: number, g: number, b: number) {
    const toHex = (n: number) => {
        return n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    }
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

let shapeId: string = "";
function updateData() {
    shapeId = props.shape.id;
    data.length = 0;
    const style = props.shape.style;
    for (let i = 0, len = style.fillsCount; i < len; i++) {
        const fill = style.getFillByIndex(i);
        const color = fill.color;
        const colorHex = toHexRgb(color.red, color.green, color.blue);
        const alpha = Number.parseFloat(fill.color.alpha.toFixed(2))
        const f: Fill = {
            id: i,
            color: colorHex,
            opacity: alpha,
            visibility: fill.isEnabled
        }
        data.push(f);
    }
}

function watcher(...args: any[]) {
    if (args.length > 0 && args[0] == 'fill') updateData();
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

onMounted(() => {
    updateData();
    // props.shape.watch(watcher)
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

function addFill(): void {
    data.push({
        id: data.length,
        color: '#000000',
        opacity: 0.20,
        visibility: true
    })
    const color = new Color(0, 0, 0, 0.2);
    editor.value.setFillColor(data.length, color);
}

function deleteFill(id: number): void {
    const index = data.findIndex(i => i.id === id)
    if (index >= 0) {
        data.splice(index, 1);
        editor.value.deleteFill(index);
    }
   
}

function toggleVisible(id: number): void {
    const isVisible: boolean = data[id]?.visibility;
    editor.value.setFillEnable(id, !isVisible);
}

function setColor(id: number, clr: string, alpha: number) {
    const res = clr.match(Reg_HEX);
    if (!res) {
        // todo
        return;
    }
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    editor.value.setFillColor(id, new Color(r, g, b, alpha))
}

function onColorChange(f: Fill, e: Event) {
    let value = (e.target as HTMLInputElement)?.value;
    if (Reg_HEX.test(value)) {
        setColor(f.id, value, f.opacity)
    } else {
        message('danger', t('system.illegal_input'));
    }
}

function onAlphaChange(f: Fill, e: Event) {
    let value = Number(Number.parseFloat((e.target as HTMLInputElement)?.value).toFixed(2));
    if (value >= 0 && value <= 1) {
        setColor(f.id, f.color, value)
    } else {
        message('danger', t('system.illegal_input'));
    }
}
function getColorFromPicker(color: number[], f: Fill) {
    console.log('-color-');
    
    const c = toHexRgb(color[0], color[1], color[2])
    setColor(f.id, c, f.opacity)
}

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
            <div class="fill" v-for="f in data" :key="f.id">
                <div :class="f.visibility ? 'visibility' : 'hidden'" @click="toggleVisible(f.id)">
                    <svg-icon v-if="f.visibility" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <!-- <ColorPicker :color="f.color" @choosecolor="c => getColorFromPicker(c, f)"></ColorPicker> -->
                    <div class="color-block" :style="{backgroundColor: f.color, opacity: f.opacity}" />
                    <input
                        :value="f.color"
                        :spellcheck ="false"
                        @change="(e) => onColorChange(f, e)"
                    />
                    <input
                        style="text-align: center;"
                        :value="f.opacity"
                        @change="(e) => onAlphaChange(f, e)"
                    />
                </div>
                <div class="space"></div>
                <div class="delete" @click="deleteFill(f.id)">
                    <svg-icon icon-class="delete"></svg-icon>
                </div>
            </div>
            
        </div>
    </div>
</template>

<style scoped lang="scss">
.ml-24 {
    margin-left: 24px;
}
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
                .color-block {
                    width: 16px;
                    height: 16px;
                    background-color: #cecece;
                }
                input {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 80px;
                    margin-left: 10px;
                }
                input + input {
                    width: 30px;
                }
            }
            .space {
                width: 30px;
            }
            .delete {
                flex-shrink: 0;
                width: 16px;
                height: 16px;
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