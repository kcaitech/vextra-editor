<script setup lang="ts">
import IconText from "@/components/common/IconText.vue";
import {ref, reactive} from "vue";
import {Context} from "@/context";
import {useI18n} from 'vue-i18n';

interface Props {
    context: Context
}

interface ModelState {
    x: boolean
    y: boolean
    r: boolean
    tool: boolean
}

const props = defineProps<Props>();
const x = ref<number | string>(0);
const y = ref<number | string>(0);
const r = ref<number | string>(0);
const model_state: ModelState = reactive({x: true, y: true, r: false, tool: true});
const t = useI18n().t;

function onChangeX() {
}

function onChangeY() {
}

function onChangeR() {
}

function exit() {
    props.context.workspace.setPathEditMode(false);
}
</script>
<template>
    <div class="table">
        <div class="tr">
            <IconText class="td position" ticon="X" :text="typeof (x) === 'number' ? x.toFixed(2) : x"
                      @onchange="onChangeX" :disabled="model_state.x" :context="context"/>
            <div class="space"></div>
            <IconText class="td position" ticon="Y" :text="typeof (y) === 'number' ? y.toFixed(2) : y"
                      @onchange="onChangeY" :disabled="model_state.y" :context="context"/>
            <div class="space"></div>
        </div>
        <div class="tr">
            <IconText class="td position" ticon="R" :text="typeof (r) === 'number' ? r.toFixed(2) : r"
                      @onchange="onChangeR" :disabled="model_state.r" :context="context"/>
        </div>
        <div class="tr">
            <div class="tool"></div>
        </div>
        <div class="tr">
            <div class="btn" @click="exit">
                {{ t('attr.exit_path_edit') }}
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 2px 10px 12px 10px;
    box-sizing: border-box;
    visibility: visible;

    .tr {
        position: relative;
        width: 100%;
        height: 30px;
        align-items: center;
        justify-content: space-between;
        display: flex;
        flex-direction: row;
        margin: 4px 0;

        .position {
            width: 95px;
            height: 30px;
            border-radius: var(--default-radius);
        }

        .space {
            width: 18px;
        }

        > .icontext {
            background-color: rgba(#D8D8D8, 0.4);
        }


        .frame {
            width: 95px;
            height: 30px;
            border-radius: var(--default-radius);
        }

        .tool {
            width: 64%;
            height: 100%;
            border-radius: var(--default-radius);;
            background-color: var(--input-background);
        }

        .btn {
            width: 100%;
            height: 100%;
            border-radius: 4px;
            background-color: var(--active-color-beta);
            color: var(--theme-color-anti);
            text-align: center;
            line-height: 30px;
            cursor: pointer;
        }
    }
}

</style>