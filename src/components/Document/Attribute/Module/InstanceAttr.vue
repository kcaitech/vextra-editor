<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick } from 'vue'
import e from 'express';
const { t } = useI18n();
const props = defineProps<{
    context: Context
}>()

const resetMenu = ref(false)
const selectReset = (e: MouseEvent) => {
    if(resetMenu.value) return resetMenu.value = false
    resetMenu.value = true
    document.addEventListener('mousedown', closeResetMenu)
}

const closeResetMenu = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.reset_svg')) {
        resetMenu.value = false
    }
    document.removeEventListener('mousedown', closeResetMenu)
}
</script>

<template>
     <TypeHeader :title="'实例属性'" class="mt-24">
        <template #tool>
            <div class="edit-comps">
                <div class="edit_svg">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
                <div class="reset_svg" @click="selectReset">
                    <svg-icon icon-class="add"></svg-icon>
                    <div class="reset_menu" v-if="resetMenu">
                        <div class="untie">
                            <span>解绑</span>
                            <span>快捷键</span>
                        </div>
                        <div class="reset">重置全部属性</div>
                    </div>
                </div>
            </div>
        </template>
    </TypeHeader>
    <div class="module_container">
        <div class="module_state_item">
            <div class="state_item">
                <div class="state_name">属性1</div>
                <div class="state_value">
                    <span>默认</span>
                    <svg-icon icon-class="down"></svg-icon>
                </div>
            </div>
            <div class="delete"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.edit-comps {
    width: 44px;
    height: 22px;
    display: flex;
    align-items: center;
    .edit_svg {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        >svg {
            width: 50%;
            height: 50%;
        }
    }
    .reset_svg {
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
        .reset_menu {
            position: absolute;
            top: 25px;
            right: 0;
            width: 150px;
            padding: 5px 0;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 100;
            .untie {
                height: 25px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                box-sizing: border-box;
                &:hover {
                    background-color: var(--active-color);
                    color: #fff;
                }
            }
            .reset {
                height: 25px;
                width: 100%;
                display: flex;
                align-items: center;
                padding: 0 10px;
                box-sizing: border-box;
                &:hover {
                    background-color: var(--active-color);
                    color: #fff;
                }
            }
        }
    }
   
}
.module_container {
    font-size: var(--font-default-fontsize);
    margin-bottom: 10px;
    .module_state_item {
        display: flex;
        align-items: center;
        margin-bottom: 3px;
        .state_item {
            display: flex;
            align-items: center;
            width: 100%;
            height: 30px;
            .state_name {
                display: flex;
                align-items: center;
                width: 30%;
                height: 100%;
            }
            .state_value {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                flex: 1;
                height: 100%;
                background-color: #ccc;
                >svg {
                    width: 12px;
                    height: 12px;
                }
            }
        }
        .delete {
            flex: 0 0 22px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 22px;
            height: 22px;
        }
    }
}
</style>