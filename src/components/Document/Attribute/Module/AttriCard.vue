<script lang="ts" setup>
import { Context } from "@/context";
import { Variable, VariableType } from '@kcdesign/data';
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CompLayerShow from "@/components/Document/Attribute/PopoverMenu/CompLayerShow.vue";

interface Props {
    context: Context
    variable: Variable
}

const { t } = useI18n();
const props = defineProps<Props>();
const attrInput = ref('');
const input_s = ref<HTMLInputElement>();
const showRename = ref(false);
const iseditLayerShow = ref(false);
const iseditText = ref(false);
const iseditToggle = ref(false);
const visible_card = ref<HTMLDivElement>();
const text_card = ref<HTMLDivElement>();
const instance_card = ref<HTMLDivElement>();
const dialog_posi = ref({ x: 0, y: 0 });

function selectAllText(event: FocusEvent) {
    (event.target as HTMLInputElement).select(); // 选择输入框内的文本
}
function closeInput() {
    showRename.value = false;
}
function keyboard_watcher(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        showRename.value = false
    }
}
function rename() {
    showRename.value = true;
    nextTick(() => {
        const el = input_s.value;
        if (el) {
            (el as HTMLInputElement).focus();
            (el as HTMLInputElement).value = '';
        }
    })
}
function get_dialog_posi(div: HTMLDivElement | undefined) {
    if (div) {
        const el = div.getBoundingClientRect();
        dialog_posi.value.x = el.x - (el.width + 32);
        dialog_posi.value.y = el.y;
    }
}
function edit_visible() {
    get_dialog_posi(visible_card.value);
    iseditLayerShow.value = true;
}
function save_layer_show() {
    iseditLayerShow.value = false;
}
function edit_text() {
    get_dialog_posi(visible_card.value);
    iseditText.value = true;
}
function save_text() {
    iseditText.value = false;
}
function edit_instance() {
    get_dialog_posi(instance_card.value);
    iseditToggle.value = true;
}
function save_instance() {
    iseditToggle.value = false;
}
</script>
<template>
    <!--组件状态-->
    <div v-if="props.variable.type === VariableType.Status">
        <div class="attr_con">
            <div class="module_input" v-if="showRename">
                <el-input ref="input_s" v-model="attrInput" @focus="selectAllText" class="input" @blur="closeInput"
                    @keydown="keyboard_watcher" />
            </div>
            <div class="module_item_left" @dblclick="rename" v-else>
                <div class="module_name">
                    <svg-icon icon-class="comp-state"></svg-icon>
                    <span class="name">{{ props.variable.name }}</span>
                </div>
                <div><span class="name">数据来源待定</span></div>
            </div>
            <div class="delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <div class="warn" v-if="false">{{ t('compos.duplicate_name') }}</div>
    </div>
    <!--显示状态-->
    <div v-if="props.variable.type === VariableType.Visible">
        <div class="module_attr_item" ref="visible_card">
            <div class="attr_con">
                <div class="module_item_left" @click="edit_visible">
                    <div class="module_name">
                        <svg-icon icon-class="eye-open"></svg-icon>
                        <span class="name">{{ props.variable.name }}</span>
                    </div>
                    <div><span class="name">数据来源待定</span></div>
                </div>
                <div class="delete">
                    <svg-icon icon-class="delete"></svg-icon>
                </div>
            </div>
            <CompLayerShow :context="props.context" v-if="iseditLayerShow" @close-dialog="iseditLayerShow = false"
                right="250px" :width="260" :add-type="VariableType.Visible" :title="t('compos.layer_isShow')"
                @save-layer-show="save_layer_show" :dialog_posi="dialog_posi">
            </CompLayerShow>
        </div>
    </div>
    <!--文本内容-->
    <div v-if="props.variable.type === VariableType.Text">
        <div class="module_attr_item" ref="text_card">
            <div class="attr_con">
                <div class="module_item_left" @click="edit_text">
                    <div class="module_name">
                        <svg-icon icon-class="text" style="width: 10px; height: 10px;"></svg-icon>
                        <span class="name">{{ props.variable.name }}</span>
                    </div>
                    <div><span class="name">数据来源待定</span></div>
                </div>
                <div class="delete">
                    <svg-icon icon-class="delete"></svg-icon>
                </div>
            </div>
            <CompLayerShow :context="context" v-if="iseditText" @close-dialog="iseditText = false" right="250px"
                :width="260" :add-type="VariableType.Status" :title="t('compos.text_content')" @save-layer-show="save_text"
                :dialog_posi="dialog_posi">
            </CompLayerShow>
        </div>
    </div>
    <!--实例切换-->
    <div v-if="props.variable.type === VariableType.Instance">
        <div class="module_attr_item" ref="instance_card">
            <div class="attr_con">
                <div class="module_item_left" @click="edit_instance">
                    <div class="module_name">
                        <svg-icon icon-class="pattern-rectangle"
                            style="width: 10px; height: 10px; transform: rotate(45deg); margin-top: 0;"></svg-icon>
                        <span class="name">{{ props.variable.name }}</span>
                    </div>
                    <div><span class="name">数据来源待定</span></div>
                </div>
                <div class="delete">
                    <svg-icon icon-class="delete"></svg-icon>
                </div>
            </div>
            <CompLayerShow :context="context" v-if="iseditToggle" @close-dialog="iseditToggle = false" right="250px"
                :width="260" :add-type="VariableType.Instance" :title="t('compos.instance_toggle')"
                @save-layer-show="save_instance" :dialog_posi="dialog_posi"></CompLayerShow>
        </div>
    </div>
</template>
<style lang="scss" scoped></style>