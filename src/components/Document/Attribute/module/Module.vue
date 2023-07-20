<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref } from 'vue'
const props = defineProps<{
    context: Context
}>()
const { t } = useI18n();
const compsType = ref(false)
const selectComps = ref<HTMLDivElement>()

const selectCompsType = () => {
    compsType.value = true
    document.addEventListener('mousedown', closeCompsType)
}

const closeCompsType = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.add-comps')) {
        compsType.value = false
    }
    document.removeEventListener('mousedown', closeCompsType)
}



</script>

<template>
    <div class="module-panel">
        <TypeHeader :title="t('navi.comps')" class="mt-24">
            <template #tool>
                <div class="add-comps" @click="selectCompsType">
                    <svg-icon icon-class="add"></svg-icon>
                    <div class="selectType" v-if="compsType" ref="selectComps">
                        <div class="type-title">请选择属性类型:</div>
                        <div class="status">
                            <svg-icon icon-class="pattern-arrow"></svg-icon>
                            <span>组件状态</span>
                        </div>
                        <div class="status">
                            <svg-icon icon-class="eye-open"></svg-icon>
                            <span>显示状态</span>
                        </div>
                        <div class="status">
                            <svg-icon icon-class="pattern-rectangle"></svg-icon>
                            <span>实例切换</span>
                        </div>
                        <div class="status">
                            <svg-icon icon-class="text"></svg-icon>
                            <span>文本内容</span>
                        </div>
                    </div>
                </div>
            </template>
        </TypeHeader>
    </div>
</template>

<style scoped lang="scss">
.module-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;
    .add-comps {
        position: relative;
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
        .selectType {
            position: absolute;
            top: 25px;
            right: 0;
            width: 120px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 5px 0;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 100;
            .type-title {
                display: flex;
                align-items: center;
                height: 30px;
                padding: 0 10px;
            }
            .status {
                display: flex;
                align-items: center;
                height: 25px;
                padding: 2px 10px;
                >svg {
                    width: 14px;
                    height: 14px;
                    margin-right: 10px;
                }
                &:hover {
                    background-color: var(--active-color);
                    color: #fff;
                }
            }
        }
    }
    
}
</style>