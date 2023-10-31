<script lang="ts" setup>
import {useI18n} from 'vue-i18n';
import {Context} from '@/context';
import TypeHeader from '../TypeHeader.vue';
import {onMounted, onUnmounted, ref, watch} from 'vue'
import CompLayerShow from '../PopoverMenu/ComposAttri/CompLayerShow.vue';
import {SymbolShape, VariableType} from '@kcdesign/data';
import {
    AttriListItem,
    create_ref_var, create_text_var, create_var_by_type,
    create_visible_var,
    is_wrong_bind_sym,
    make_status,
    variable_sort
} from "@/utils/symbol";
import SelectLayerInput from "./SelectLayerInput.vue";
import PopoverDefaultInput from './PopoverDefaultInput.vue';
import {cardmap} from "./ComponentStatusCard/map";
import Status from "./ComponentStatusCard/SCStatus.vue";
import {Warning} from '@element-plus/icons-vue';
import {message} from "@/utils/message";

const {t} = useI18n();

interface Props {
    context: Context
    shape: SymbolShape
}

const props = defineProps<Props>()
const compsType = ref(false)
const selectComps = ref<HTMLDivElement>()
const isaddStateDialog = ref(false)
const dialog_title = ref('');
const atrrdialog = ref<HTMLDivElement>();
const addType = ref<VariableType>(VariableType.Visible);
const variables = ref<AttriListItem[]>();
const conflict = ref<boolean>(false);
const selected = ref<string[]>([]);
const var_name = ref<string>('');
const dlt_value = ref<any>(true);
function close() {
    const is_achieve_expected_results = compsType.value;
    compsType.value = false;
    return is_achieve_expected_results;
}

const closeCompsType = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.add-comps')) {
        close();
        return;
    }
    document.removeEventListener('mousedown', closeCompsType)
}

function update_variable_list() {
    variables.value = variable_sort(props.shape);
    conflict.value = is_wrong_bind_sym(props.shape);
}

/**
 * @description 选择需要添加的组件变量类型
 */
function selectCompsType() {
    if (compsType.value) {
        close();
        return;
    }
    compsType.value = true;
    document.addEventListener('mousedown', closeCompsType);
    props.context.esctask.save(close);
}

/**
 * @description 添加一个组件状态
 */
const addModuleState = () => {
    const make_result = make_status(props.context, t)
    if (make_result) {
        props.context.selection.selectShape(make_result);
    }
    close();
}
/**
 * @description 添加一条显示状态
 */
const layerIsShow = () => {
    dialog_title.value = t('compos.layer_isShow');
    addType.value = VariableType.Visible;
    get_dialog_posi(atrrdialog.value);
    isaddStateDialog.value = true;
    props.context.esctask.save(de_layer_is_show);
    close();
}

function de_layer_is_show() {
    const is_achieve_expected_results = isaddStateDialog.value;
    isaddStateDialog.value = false;
    return is_achieve_expected_results;
}

/**
 * @description 文本内容
 */
const addTextDialog = () => {
    dialog_title.value = t('compos.text_content');
    addType.value = VariableType.Text;
    get_dialog_posi(atrrdialog.value);
    isaddStateDialog.value = true;
    close();
}
/**
 * @description 实例切换
 */
const examplesToggle = () => {
    dialog_title.value = t('compos.instance_toggle');
    addType.value = VariableType.SymbolRef;
    get_dialog_posi(atrrdialog.value);
    isaddStateDialog.value = true;
    close();
}
const warn = ref(false);
const saveLayerShow = (type: VariableType) => {
    if (!selected.value.length) {
        message('info', '请选择图层');
        return;
    }
    if (!var_name.value.trim()) {
        message('info', '属性名不能为空');
        return;
    }
    if(typeof dlt_value.value === 'string' && dlt_value.value.trim().length < 1) {
        return warn.value = true;
    }
    const symbolshape = props.context.selection.symbolshape;
    if(!symbolshape) return;
    create_var_by_type(props.context, type, var_name.value, dlt_value.value, selected.value, symbolshape);
    isaddStateDialog.value = false;
}

const dialog_posi = ref({x: 0, y: 0});
/**
 * @description 根据触发元素获取弹窗位置
 */
const get_dialog_posi = (div: HTMLDivElement | undefined) => {
    if (div) {
        const el = div.getBoundingClientRect();
        dialog_posi.value.x = el.x - (el.width + 32);
        dialog_posi.value.y = el.y;
    }
}

function variable_watcher(args: any[]) {
    if (args && (args.includes('map') || args.includes('childs'))) update_variable_list();
}

function list_change(data: string[]) {
    selected.value = data;
}

function name_change(v: string) {
    var_name.value = v;
}

function dlt_change(v: number) {
    dlt_value.value = !v;
}
function text_dlt_change(v: string) {
    dlt_value.value = v;
}

watch(() => props.shape, (v, o) => {
    v.watch(variable_watcher);
    o.unwatch(variable_watcher);
    variables.value = variable_sort(v);
})
onMounted(() => {
    props.shape.watch(variable_watcher);
    update_variable_list();
})
onUnmounted(() => {
    props.shape.unwatch(variable_watcher);
})
</script>

<template>
    <div style="position: relative; margin-bottom: 10px;" ref="atrrdialog">
        <!--header-->
        <TypeHeader :title="t('compos.compos_attr')" class="mt-24" @click="selectCompsType">
            <template #tool>
                <div class="add-comps" @click.stop="selectCompsType">
                    <svg-icon icon-class="add"></svg-icon>
                    <div class="selectType" v-if="compsType" ref="selectComps" @click.stop>
                        <div class="type-title">{{ t('compos.delect_attr_type') }}:</div>
                        <div class="status" @click="addModuleState">
                            <div>
                                <svg-icon icon-class="comp-state"></svg-icon>
                            </div>
                            <span>{{ t('compos.compos_state') }}</span>
                        </div>
                        <div class="status" @click="layerIsShow">
                            <div>
                                <svg-icon icon-class="eye-open"></svg-icon>
                            </div>
                            <span>{{ t('compos.display_state') }}</span>
                        </div>
                        <div class="status" @click="examplesToggle">
                            <div>
                                <svg-icon icon-class="pattern-rectangle"
                                          style="transform: rotate(45deg);width: 10px; height: 10px;"></svg-icon>
                            </div>
                            <span>{{ t('compos.instance_toggle') }}</span>
                        </div>
                        <div class="status" @click="addTextDialog">
                            <div>
                                <svg-icon icon-class="text" style="width: 10px; height: 10px;"></svg-icon>
                            </div>
                            <span>{{ t('compos.text_content') }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <!--list container-->
        <div class="module_container">
            <component v-for="item in variables" :is="cardmap.get(item.variable.type) || Status" :key="item.variable.id"
                       :context="props.context"
                       :variable="item.variable" :item="item"></component>
        </div>
        <div v-if="conflict" class="conflict_warn">
            <div>
                <el-icon>
                    <Warning/>
                </el-icon>
            </div>
            <p>存在状态相同的可变组件，需要修改状态以解决冲突</p>
        </div>
        <!--dialog-->
        <CompLayerShow :context="context" v-if="isaddStateDialog" @close-dialog="isaddStateDialog = false" right="250px"
                       :width="260" :addType="addType" :title="dialog_title" :dialog_posi="dialog_posi"
                       @save-layer-show="saveLayerShow" @name-change="name_change" :selected_layer="selected">
            <template #layer>
                <SelectLayerInput
                    :title="addType === VariableType.SymbolRef ? t('compos.compos_instance') : t('compos.select_layer')"
                    :add-type="addType" :context="props.context"
                    :placeholder="addType === VariableType.SymbolRef ? t('compos.place_select_instance') : t('compos.place_select_layer')"
                    @change="list_change"
                >
                </SelectLayerInput>
            </template>
            <template #default_value>
                <PopoverDefaultInput v-if="addType !== VariableType.SymbolRef" :context="context" :warn="warn"
                                     :add-type="addType" @select="dlt_change" @change="text_dlt_change"></PopoverDefaultInput>
            </template>
        </CompLayerShow>
    </div>
</template>

<style lang="scss" scoped>
.add-comps {
    position: relative;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;

    > svg {
        width: 50%;
        height: 50%;
    }

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

            div {
                width: 20px;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 5px;
            }

            svg {
                width: 14px;
                height: 14px;
            }

            &:hover {
                background-color: var(--active-color);
                color: #fff;
            }
        }
    }
}

.conflict_warn {
    display: flex;
    width: 100%;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;
    border: 0.5px solid rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    padding: 10px;

    > div {
        display: flex;
        align-items: center;
        width: 20px;
        height: 20px;
        margin-right: 10px;
    }

    > p {
        margin: 0;
    }
}

.module_container {
    font-size: var(--font-default-fontsize);
    margin-bottom: 10px;

    .module_attr_item {
        position: relative;
        display: flex;
        flex-direction: column;
        margin-bottom: 5px;

        .attr_con {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .module_item_left {
            display: flex;
            align-items: center;
            border-radius: 4px;
            background-color: var(--grey-light);
            width: 100%;
            height: 30px;

            .module_name {
                width: 45%;

                > svg {
                    width: 14px;
                    height: 14px;
                    margin: -2px 10px;
                }
            }

            .name {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .module_input {
            display: flex;
            align-items: center;
            width: 100%;
            height: 30px;

            .el-input {
                font-size: 10px;
                height: 30px;
            }
        }

        .warn {
            color: red;
            transform: scale(.9);
        }

        .delete {
            flex: 0 0 22px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 22px;
            height: 22px;

            > svg {
                width: 11px;
                height: 11px;
            }

            transition: .2s;
        }
    }
}

:deep(.el-input__inner) {
    --el-input-inner-height: 100%;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset;
}</style>