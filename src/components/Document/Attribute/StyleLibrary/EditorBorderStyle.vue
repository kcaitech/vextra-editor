<template>
    <div class="editor-style" :style="{ top: props.top + 'px', left: props.left + 'px' }">
        <div class="header">
            <div class="title">{{ props.type === 'editor' ? '编辑边框样式' : '创建边框样式' }}</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input type="text" id="name">
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
                    :selected="positonOptionsSource.find(i => i.data.value === '内部')?.data"
                    @select="positionSelect"></Select>
            </div>
            <div class="thickness">
                <div class="title">粗细</div>
                <input type="text">
            </div>
        </div>
        <div v-if="props.type !== 'editor'" class="create-bnt" @click.stop="emits('close')">创建样式</div>
    </div>

</template>
<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BorderPosition } from '@kcdesign/data';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, genOptions } from '@/utils/common';

const props = defineProps<{
    type: string;
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
const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);

function positionSelect(selected: SelectItem, id: number | undefined) {

}


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
