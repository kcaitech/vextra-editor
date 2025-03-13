/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import LableType from './LableType.vue';
import { Selection } from '@/context/selection';
import { Context } from '@/context';
import LableTootip from './LableTootip.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const props = defineProps<{
    context: Context
}>();
const copy_text = ref(false);
const copy_code = ref(false);
const copy_all = ref(false);
const shapesCssInfo = ref<any[]>([]);
const copyLable = async (e: MouseEvent) => {
    const clickedDiv = e.target as HTMLDivElement; // 获取点击的<div>元素
    const text = clickedDiv.textContent;
    if (text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(() => {
                copy_text.value = true;

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
            textArea.remove()
        }
    }
}
const copyCode = () => {
    const el = document.getElementById('code');
    const code = el?.textContent;
    if (code) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(code).then(() => {
                copy_code.value = true;
            }, () => {
                console.log(`${t('lable.copyfailure')}`);
            })
        } else {
            const textArea = document.createElement('textarea')
            textArea.value = code;
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            document.execCommand('copy')
            copy_code.value = true;
            textArea.remove()
        }
    }
}
const toHex = (r: number, g: number, b: number) => {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return '#' + hex(r) + hex(g) + hex(b);
}

const toRGBA = (r: number, g: number, b: number, a: number) => {
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

const getShapeInfo = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length > 0) {
        const shape = shapes[0];
        const witch = shape.frame.width.toFixed(2);
        const height = shape.frame.height.toFixed(2);
        let color = ''
        const fills = shape.getFills();
        if (fills[0]) {
            const fill = fills[0].color
            if (fill.alpha === 1) {
                color = toHex(fill.red, fill.green, fill.blue);
            } else {
                color = toRGBA(fill.red, fill.green, fill.blue, fill.alpha);
            }
        }
        const css = `<span style="color: rgba(0, 0, 0, 0.33);">/* ${shape.name} */</span>
    
    position: <span style="color: #f3911a;">absolute</span>;
    width: <span style="color: #f3911a;">${witch}px</span>;
    height: <span style="color: #f3911a;">${height}px</span>;
    opacity: <span style="color: #f3911a;">1</span>;
    
    background: <span style="color: #f3911a;">${color}</span>;
          `
        const el = document.getElementById('code');
        if (el) {
            el.innerHTML = css;
        }
    }
}


function selection_wather(t: any) {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
        getShapeInfo();
    }
}

onMounted(() => {
    getShapeInfo();
    props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})

</script>

<template>
    <div class="container">
        <LableType :title="t('lable.code')">
            <template #select>
                <div class="button">
                    <LableTootip :copy_text="copy_code" :visible="copy_all === true" :copy="t('lable.copy_all')"
                        placement="top">
                        <button @click="copyCode" @mouseenter.stop="copy_all = true"
                            @mouseleave.stop="copy_all = false, copy_code = false">{{ t('lable.copy') }}</button>
                    </LableTootip>
                </div>
            </template>
            <template #body>
                <div class="code_content">
                    <pre class="lang_css">
                        <code class="code_box" id="code"></code>
                    </pre>
                </div>
            </template>
        </LableType>
    </div>
</template>

<style scoped lang="scss">
.button {
    height: 30px;
    display: flex;
    align-items: center;

    button {
        font-size: 10px;
        width: 60px;
        border: none;
        height: 25px;
        background-color: var(--active-color);
        color: #fff;
        border: 1px solid var(--active-color);
        border-radius: 4px;
    }
}

.code_content {
    background-color: #e6e6e6;
    margin-left: -8px;
    margin-right: -10px;
    line-height: 24px;

    .lang_css {
        display: flex;
        align-items: center;
        padding: 12px;
        font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
        white-space: pre-line;
        word-break: break-all;
        user-select: text;
        -webkit-user-select: text;

        .code_box {
            font-size: 13px;
            padding-right: 20px;
            font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
        }
    }
}

#code {
    >span {
        cursor: default;
    }

    cursor: default;
}
</style>