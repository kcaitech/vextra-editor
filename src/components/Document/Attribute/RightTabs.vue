<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch, watchEffect} from "vue";
import {Context} from "@/context";
import Design from "@/components/Document/Attribute/Design.vue";
import CompsTab from "@/components/Document/Navigation/CompsTab.vue";
import ResourceTab from "@/components/Document/Navigation/ResourceTab.vue";
import {useI18n} from 'vue-i18n';
import {Perm} from "@/context/workspace";
import {Tool} from "@/context/tool";
import Lable from './Lable/index.vue'

const {t} = useI18n();

const props = defineProps<{
    context: Context
    rightTriggleVisible: boolean
    showRight: boolean
}>();
const emit = defineEmits<{
    (e: 'showAttrbute'): void
}>()

// type Tab = "Design" | "Prototype" | "Inspect";
type Tab = "Design" | "Inspect";

const perm = ref(props.context.workspace.documentPerm)
const currentTab = ref<Tab>("Design");
const tabs: { title: string, id: Tab }[] = [
    {
        title: t('attr.design'),
        id: 'Design'
    },
    // {
    //     title: t('attr.prototype'),
    //     id: 'Prototype'
    // },
    {
        title: t('attr.inspect'),
        id: 'Inspect'
    }
]
const isLable = ref(props.context.tool.isLable);

function toggle(id: Tab) {
    if (id === 'Design') {
        if (props.context.selection.selectedShapes.length === 1) {
            props.context.selection.selectShape(props.context.selection.selectedShapes[0]);
        }

    }
    currentTab.value = id;
    updateUnderlinePosition();
}

const showHiddenRight = () => {
    emit('showAttrbute')
}

const tool_watcher = (t: number) => {
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
        if (isLable.value && !props.showRight) {
            emit('showAttrbute');
        }
    }
}

onMounted(() => {
    props.context.tool.watch(tool_watcher)
    if (controllerRef.value) {
        console.log("ref:", controllerRef.value);
        const current = controllerRef.value[0];
        underlineWidth.value = current.clientWidth/tabs.length;
        const x = current.offsetLeft;
        const w = current.clientWidth;
        underlinePosition.value = (x + w / 2);
    }
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher)
})
const controllerRef = ref<HTMLElement[] | null>(null);
const underlineWidth = ref(0);
const underlinePosition = ref(0);

function updateUnderlinePosition() {
    const tabIndex = tabs.findIndex((tab) => tab.id === currentTab.value)+1;
    console.log(tabIndex)
    underlinePosition.value = tabIndex * underlineWidth.value;

}
</script>

<template>
    <div class="tab-container">
        <template v-if="!isLable">
            <div class="controller">
                <div :class="{ tab: true, active: currentTab === i.id }" v-for="(i, index) in tabs" :key="index"
                     @click="toggle(i.id)" ref="controllerRef">{{ i.title }}
                </div>
                <div class="underline"
                     :style="{ width: underlineWidth + 'px', left: `${underlinePosition}px`, transform: `translateX(-50%)` }"></div>
            </div>
            <div class="body">
                <Design :context="props.context" v-if="currentTab === 'Design'"></Design>
                <!-- <CompsTab :context="props.context" v-if="currentTab === 'Prototype'"></CompsTab> -->
                <ResourceTab :context="props.context" v-if="currentTab === 'Inspect'"></ResourceTab>
                <template v-if="perm === Perm.isEdit">
                    <div class="showHiddenR" @click="showHiddenRight" v-if="!showRight || rightTriggleVisible"
                         :style="{ opacity: showRight ? 1 : 0.6 }">
                        <svg-icon v-if="showRight" class="svg" icon-class="right"></svg-icon>
                        <svg-icon v-else class="svg" icon-class="left"></svg-icon>
                    </div>
                </template>
            </div>
        </template>
        <div class="tab-lable" v-else>
            <Lable :context="context"></Lable>
            <div class="showHiddenR" @click="showHiddenRight" v-if="!showRight || rightTriggleVisible"
                 :style="{ opacity: showRight ? 1 : 0.6 }">
                <svg-icon v-if="showRight" class="svg" icon-class="right"></svg-icon>
                <svg-icon v-else class="svg" icon-class="left"></svg-icon>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;
    box-shadow: -4px 0px 4px rgba($color: #000000, $alpha: 0.05);

    .controller {
        display: flex;
        height: 40px;

        > .tab {
            cursor: pointer;
            padding: 13px 14px 13px 14px;
            font-size: 12px;
            font-weight: 500;
            font-feature-settings: "kern" on;
            color: #000000;
        }

        > .tab:hover {
            color: var(--theme-color);
        }

        > .active {
            border-radius: 4px 4px 0 0;
            color: var(--theme-color);
        }

        .underline {
            border: 2px #000000 solid;
            border-radius: 292px;
            position: absolute;
            top: 37px;
            transition: left 0.3s ease-in-out;
            box-sizing: border-box;
            height: 1px;
            flex: 0 0 auto;
        }
    }

    .body {
        border-top: 1px solid #F0F0F0;
        width: 100%;
        height: calc(100% - 36px);
        position: relative;
        flex: 1 1 auto;
        box-sizing: border-box;
    }
}

.showHiddenR {
    position: absolute;
    left: -16px;
    top: 0%;
    transform: translateY(-50%);
    z-index: 9;
    cursor: pointer;
    background-color: var(--theme-color-anti);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: -4px 0px 8px rgba($color: #000000, $alpha: 0.05);
    width: 16px;
    height: 44px;
    border-radius: 8px 0px 0px 8px;
    opacity: 1;
    box-sizing: border-box;
    border: 1px solid #F0F0F0;

    > .svg {
        width: 10px;
        height: 10px;
    }
}

.tab-lable {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #fff;
    box-shadow: -4px 0px 4px rgba($color: #000000, $alpha: 0.05);
}
</style>