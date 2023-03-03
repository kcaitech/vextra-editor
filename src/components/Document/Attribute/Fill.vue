<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-03 14:52:04
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 17:44:28
 * @FilePath: \kcdesign\src\components\Document\Attribute\TypeHeader.vue
-->
<script setup lang="ts">
import { defineProps, reactive } from 'vue';
import { Context } from '@/context';
import { Shape } from '@/data/shape';
import TypeHeader from './TypeHeader.vue';
import "@/assets/icons/svg/delete.svg";
const props = defineProps<{
    context?: Context,
    shape?: Shape,
}>();
type  Fill = {
    id: number,
    color: string,
    opacity: number,
    visibility: boolean
}

const data = reactive<{
    fills: Fill[]
}>({
    fills: [
        {
            id: 100,
            color: '#558888',
            opacity: 1,
            visibility: true
        }
    ]
})

function addFill(): void {
    data.fills.push({
        id: Date.now(),
        color: '#CDCDCD',
        opacity: 1,
        visibility: true
    })
}
function deleteFill(id: number): void {
    const index = data.fills.findIndex(i => i.id === id)
    index >= 0 && (data.fills.splice(index, 1))
}

function setVisible(id: number): void {
    const setObj = data.fills.find(i => i.id === id)
    setObj && (setObj.visibility = !setObj.visibility)
}

</script>

<template>
    <div class="fill-panel">
        <TypeHeader title="填充" class="mt-24">
            <template #tool>
                <div class="add" @click="addFill">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </template>
        </TypeHeader>
        <div class="fills-container">
            <div class="fill" v-for="f in data.fills" :key="f.id">
                <div :class="f.visibility ? 'visibility' : 'hidden'" @click="setVisible(f.id)"></div>
                <div class="color">
                    <div class="color-block" :style="{backgroundColor: f.color}" />
                    <input :value="f.color"/>
                    <input :value="f.opacity"/>
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
            }
        }
    }
}
</style>