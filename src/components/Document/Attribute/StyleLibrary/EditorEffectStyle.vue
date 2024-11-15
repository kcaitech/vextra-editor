<template>
    <div class="editor-style" :style="{ top: props.top + 'px', left: props.left + 'px' }">
        <div class="header">
            <div class="title">{{ props.type === 'editor' ? '编辑特效样式' : '创建特效样式' }}</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input type="text" id="name" v-model="name">
            </div>
            <div class="des">
                <label for="des">描述</label>
                <input type="text" id="des" v-model="des">
            </div>
        </div>
        <div class="effect">
            <div class="create-effect">
                <div class="title">特效</div>
                <div class="add" @click.stop="emits('addShadow')">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </div>
            <div class="effect-list">
                <div class="item" v-for="s in list" :key="s.id">
                    <div :class="s.isEnabled ? 'visibility' : 'hidden'"
                        @click.stop="emits('setShadowEnable', s.id, !s.isEnabled)">
                        <svg-icon v-if="s.isEnabled" icon-class="select"></svg-icon>
                    </div>
                    <Select class="select" :context="props.context" :shapes="props.shapes"
                        :source="positonOptionsSource"
                        :selected="positonOptionsSource.find(i => i.data.value === s.position)?.data"
                        @select="(value) => positionSelect(value, s.id)"></Select>
                    <div class="setting">
                        <svg-icon icon-class="gear"></svg-icon>
                    </div>
                    <div class="delete" :class="{ disable }" @click.stop="emits('delShadow', s.id)">
                        <svg-icon icon-class="delete"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="props.type !== 'editor'" class="create-bnt" @click.stop="emits('close')">创建样式</div>
    </div>

</template>
<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BorderPosition, ShadowPosition, BlurType, Shadow } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, genOptions } from '@/utils/common';
import { computed } from 'vue';

const props = defineProps<{
    type: string;
    context: Context;
    shapes: ShapeView[];
    top: number;
    left: number
    list: Shadow[] | undefined
    name:string
    des:string
}>();

const emits = defineEmits<{
    (e: 'close'): void;
    (e: 'setShadowEnable', id: string, b: boolean): void
    (e: 'addShadow'): void
    (e: 'setPosition', selected: SelectItem, id: string): void
    (e: 'delShadow', id: string): void
}>()

const { t } = useI18n();
const positonOptionsSource: SelectSource[] = genOptions([
    [ShadowPosition.Inner, t(`shadow.inner`)],
    [ShadowPosition.Outer, t(`shadow.outer`)],
    [BlurType.Gaussian, t(`blur.gaussian`)],
    [BlurType.Background, t(`blur.background`)]
]);

const name = ref<string>();
const des = ref<string>();
const disable = computed(() => {
    return props.list!.length <= 1
})

function positionSelect(selected: SelectItem, id: string) {
    emits('setPosition', selected, id)
}

const update=()=>{
    name.value=props.name
    des.value=props.des
}

onMounted(() => {
    update();
    if (props.type === 'new') {
        emits('addShadow')
    }
})


</script>
<style lang="scss" scoped>
.disable {
    pointer-events: none;
    opacity: 0.4;
}

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

    .effect {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        margin-bottom: 8px;
        box-sizing: border-box;

        .create-effect {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;

            .add {
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
                }
            }
        }

        .effect-list {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .item {
                display: flex;
                align-items: center;
                height: 32px;
                gap: 8px;

                .visibility {
                    flex: 0 0 14px;
                    width: 14px;
                    height: 14px;
                    background-color: var(--active-color);
                    box-sizing: border-box;
                    color: #ffffff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 4px;

                    >svg {
                        width: 60%;
                        height: 60%;
                    }
                }

                .hidden {
                    flex: 0 0 14px;
                    width: 14px;
                    height: 14px;
                    background: #FFFFFF;
                    border-radius: 4px;
                    border: 1px solid #EBEBEB;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .select {
                    flex: 1;
                }

                .setting,
                .delete {
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
                    }
                }
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
