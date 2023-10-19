<script setup lang="ts">
import SelectMenu from "@/components/Document/Attribute/PopoverMenu/SelectMenu.vue";
import {ArrowDown} from "@element-plus/icons-vue";
import {Context} from "@/context";
import {useI18n} from "vue-i18n";
import {nextTick, ref} from "vue";
import {StatusValueItem} from "@/utils/symbol";
interface Props {
    context: Context
    data: StatusValueItem
}
const props = defineProps<Props>();
const { t } = useI18n();
const attrValueInput = ref('默认')
const editAttrValue = ref(false)
const revalueInput = ref<HTMLInputElement>()

const onRevalue = () => {
    editAttrValue.value = true
    nextTick(() => {
        if (revalueInput.value) {
            revalueInput.value?.focus()
            revalueInput.value?.select()
        }
    })
}

const closeValueInput = () => {
    if (attrValueInput.value.trim().length === 0) return editAttrValue.value = false
    editAttrValue.value = false
}

const onEditAttrValue = (e: KeyboardEvent) => {
    if (attrValueInput.value.trim().length === 0) return editAttrValue.value = false
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        editAttrValue.value = false
    }
}
const attrValue = ref('默认')
const selectoption = ref(false)
const menuItems = ['默认']
const showMenu = () => {
    if(selectoption.value) return selectoption.value = false
    selectoption.value = true;
}

</script>
<template>
    <div class="module_state_item">
        <div class="module_con">
            <div class="state_item">
                <div class="state_name"><span>属性1</span></div>
                <div class="state_value" v-if="!editAttrValue" @dblclick.stop="onRevalue">
                    <div class="input" @click.stop="showMenu">
                        <span>{{ attrValue }}</span>
                        <el-icon>
                            <ArrowDown
                                :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }"/>
                        </el-icon>
                        <SelectMenu v-if="selectoption" :top="33" width="100%" :menuItems="menuItems"
                                    @close="selectoption = false"></SelectMenu>
                    </div>
                </div>
                <div class="module_input" v-if="editAttrValue">
                    <el-input v-model="attrValueInput" ref="revalueInput"
                              @blur="closeValueInput" @keydown="onEditAttrValue"/>
                </div>
            </div>
            <div class="delete"></div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.module_state_item {
    display: flex;
    flex-direction: column;
    margin-bottom: 3px;

    .module_con {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 30px;
    }

    .state_item {
        display: flex;
        align-items: center;
        width: 100%;
        height: 30px;

        .state_name {
            display: flex;
            align-items: center;
            width: 40%;
            height: 100%;

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .state_value {
            display: flex;
            align-items: center;
            border-radius: 4px;
            flex: 1;
            height: 100%;
            background-color: var(--grey-light);

            > svg {
                width: 10px;
                height: 10px;
            }

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .input {
                position: relative;
                width: 100%;
                height: 30px;
                border-radius: 4px;
                padding-left: 11px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                background-color: var(--grey-light);

                span {
                    flex: 1;
                }

                .el-icon {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }
    }

    .module_input {
        display: flex;
        align-items: center;
        padding-left: 10px;
        width: 100%;
        height: 30px;

        .el-input {
            font-size: 10px;
            height: 30px;
        }
    }

    .warn {
        margin-left: 30%;
        color: red;
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
</style>