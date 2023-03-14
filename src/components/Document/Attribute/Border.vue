<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-03 14:52:04
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-03 17:58:48
 * @FilePath: \kcdesign\src\components\Document\Attribute\TypeHeader.vue
-->
<script setup lang="ts">
import { defineProps, reactive } from 'vue';
import { Context } from '@/context';
import { Shape } from '@/data/data/shape';
import TypeHeader from './TypeHeader.vue';
import BorderDetail from './PopoverMenu/BorderDetail.vue';
import ColorPicker from './PopoverMenu/ColorPicker.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
    context?: Context,
    shape?: Shape,
}>();
type  Border = {
    id: number,
    color: string,
    opacity: number,
    visibility: boolean
}

const data = reactive<{
    borders: Border[]
}>({
    borders: [
        {
            id: 100,
            color: '#2C2C2C',
            opacity: 1,
            visibility: true
        }
    ]
})

function addBorder(): void {
    data.borders.push({
        id: Date.now(),
        color: '#CDCDCD',
        opacity: 1,
        visibility: true
    })
}
function deleteBorder(id: number): void {
    const index = data.borders.findIndex(i => i.id === id)
    index >= 0 && (data.borders.splice(index, 1))
}

function setVisible(id: number): void {
    const setObj = data.borders.find(i => i.id === id)
    setObj && (setObj.visibility = !setObj.visibility)
}

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
            <div class="border" v-for="f in data.borders" :key="f.id">
                <div :class="f.visibility ? 'visibility' : 'hidden'" @click="setVisible(f.id)">
                    <svg-icon v-if="f.visibility" icon-class="select"></svg-icon>
                </div>
                <div class="color">
                    <ColorPicker :color="f.color"></ColorPicker>
                    <input :value="f.color"/>
                    <input style="text-align: center;" :value="f.opacity"/>
                </div>
                <BorderDetail></BorderDetail>
                <div class="delete" @click="deleteBorder(f.id)">
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
                    position: relative;
                    width: 16px;
                    height: 16px;
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
</style>