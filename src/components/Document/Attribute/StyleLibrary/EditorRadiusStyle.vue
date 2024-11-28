<template>
    <div class="editor-style" :style="{ top: props.top + 'px', left: props.left + 'px' }" @click.stop @mousedown.stop>
        <div class="header">
            <div class="title">编辑边框样式</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input v-focus type="text" id="name" @keydown.esc="props.context.escstack.execute()">
            </div>
            <div class="des">
                <label for="des">描述</label>
                <input type="text" id="des">
            </div>
        </div>
        <div class="border">
            <div class="type">
                <div class="title">位置</div>
                <Select class="select" :context="props.context" :shapes="props.shapes" :source="positonOptionsSource"
                    :selected="positonOptionsSource.find(i => i.data.value === props.border?.position)?.data"
                    @select="positionSelect"></Select>
            </div>
            <div class="thickness">
                <div class="title">粗细</div>
                <input type="text" v-model="thickness" @change="setThickness">
            </div>
        </div>
    </div>

</template>
<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BorderPosition, Border } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, genOptions } from '@/utils/common';

const props = defineProps<{
    context: Context;
    top: number;
    left: number
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const position = ref<SelectItem>({ value: 0, content: t('attr.center') });
const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);
const thickness = ref<string>('')
const oldvalue = ref<string>('')

function positionSelect(selected: SelectItem, id: number | undefined) {

}

const setThickness = () => {
    thickness.value = thickness.value.replace(/，/g, ',').replace(/\s+/g, '').split(',').slice(0, 4).join(', ');
    const b = thickness.value.split(',').every(i => isNaN(Number(i)) === false)
    if (!b) return thickness.value = oldvalue.value;
    let arr = thickness.value.split(',')
    if (arr.length === 1) {
        thickness.value = arr.concat(...arr, ...arr, ...arr).toString()
    }
    if (arr.length === 2) {
        thickness.value = arr.concat(arr[0], arr[1]).toString()
    }
    if (arr.length === 3) {
        thickness.value = arr.concat(arr[1]).toString()
    }
    thickness.value = thickness.value.replaceAll(' ', '').replaceAll('.', '').replaceAll(',', ', ')
}

onMounted(() => {
    if (!props.border) return
    const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = props.border.sideSetting;
    thickness.value = `${thicknessTop},${thicknessRight},${thicknessBottom},${thicknessLeft}`;
})

</script>
<style lang="scss" scoped>
.editor-style {
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
