<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import Design from "@/components/Document/Attribute/Design.vue";
import Prototype from "@/components/Document/Attribute/Prototype.vue";
import ResourceTab from "@/components/Document/Navigation/ResourceTab.vue";
import { useI18n } from 'vue-i18n';
// import { Perm } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import Lable from './Lable/index.vue';
import PageAttr from "@/components/Document/Attribute/PageAttr.vue";
import { FontAvailable, fontNameListEn, fontNameListZh } from "./Text/FontNameList";
const { t } = useI18n();

interface Props {
    context: Context
    rightTriggleVisible: boolean
    showRight: boolean
}
interface Emits {
    (e: 'showAttrbute'): void
}
type Tab = "Design" |"Prototype"| "Inspect";

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const controllerRef = ref<HTMLElement>();
const underlineWidth = ref(0);
const underlinePosition = ref(0);
// const perm = ref(props.context.workspace.documentPerm);
const currentTab = ref<Tab>("Design");
const tabs: { title: string, id: Tab }[] = [
    {
        title: t('attr.design'),
        id: 'Design'
    },
    {
        title: t('attr.prototype'),
        id: 'Prototype'
    },
    // {
    //     title: t('attr.inspect'),
    //     id: 'Inspect'
    // }
];
const isLable = ref(props.context.tool.isLable);

function toggle(id: Tab) {
    currentTab.value = id;
    init();
    updateUnderlinePosition();
}
function init() {
    if (currentTab.value === 'Design') {
        const selected = props.context.selection.selectedShapes;
        if (selected.length) {
            props.context.selection.rangeSelectShape(selected);
        }
    }
}
const showHiddenRight = () => {
    emit('showAttrbute')
}

function updateUnderlinePosition() {
    underlinePosition.value = 0;
    underlineWidth.value = 0;
    if (!controllerRef.value) {
        return;
    }
    const tabIndex = tabs.findIndex((tab) => tab.id === currentTab.value);
    if (tabIndex < 0) {
        return;
    }
    const key = tabs[tabIndex].id;
    const dom = controllerRef.value.querySelector(`#tabs-id-${key}`);
    if (!dom) {
        return;
    }
    const width = (dom as HTMLDivElement).offsetWidth - 20;
    const left = (dom as HTMLDivElement).offsetLeft + 10;
    underlineWidth.value = width;
    underlinePosition.value = left + width / 2;
}
const tool_watcher = (t: number) => {
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
        if (isLable.value && !props.showRight) {
            emit('showAttrbute');
        }
    }
}
const stopMouseDown = (e: MouseEvent) => {
    const action = props.context.tool.action;
    // const comment = props.context.comment;

    // if (action === Action.AddComment && !comment.isCommentInputMove) {
    //     e.stopPropagation();
    // }
}
async function getFontNameList(fontName: string[], lang: string) {
    try {
        const results = await Promise.all(fontName.map(name => FontAvailable(name)));
        if (lang === 'zh') {
            const zh = fontName.filter((name, index) => results[index].length > 0);
            props.context.workspace.setFontNameListZh(zh)
        } else {
            const en = fontName.filter((name, index) => results[index].length > 0);
            props.context.workspace.setFontNameListEn(en)
        }
    } catch (error) {
        console.error('Error checking font availability:', error);
    }
}
onMounted(() => {
    props.context.tool.watch(tool_watcher);
    init();
    updateUnderlinePosition();
    getFontNameList(fontNameListZh, 'zh')
    getFontNameList(fontNameListEn, 'en')
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher)
})
</script>

<template>
    <div class="tab-container" @mouseup="stopMouseDown" v-if="isLable || !context.readonly">
        <template v-if="!isLable">
            <div ref="controllerRef" class="controller">
                <div v-for="(i, index) in tabs" :class="{ tab: true, active: currentTab === i.id }" :key="index"
                    :id="`tabs-id-${i.id}`" @click="toggle(i.id)"
                    :style="{ color: currentTab === i.id ? '#000000' : '#333333' }">
                    {{ i.title }}
                </div>
                <div class="underline"
                    :style="{ width: underlineWidth + 'px', left: `${underlinePosition}px`, transform: `translateX(-50%)` }">
                </div>
            </div>
            <div class="body">
                <Design :context="props.context" v-if="currentTab === 'Design'"></Design>
                <Prototype :context="props.context" v-if="currentTab === 'Prototype'"></Prototype>
                <ResourceTab :context="props.context" v-if="currentTab === 'Inspect'"></ResourceTab>
                <template v-if="!context.readonly">
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
                :style="{ opacity: showRight ? 1 : 0.6, transform: ' translateY(50%)' }">
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
    border: 1px solid #EBEBEB;

    .controller {
        display: flex;
        height: 40px;
        position: relative;

        >.tab {
            cursor: pointer;
            padding: 13px 14px 13px 14px;
            font-size: 12px;
            font-weight: 400;
            color: #000000;
        }

        //>.tab:hover {
        //    color: var(--theme-color);
        //}

        >.active {
            border-radius: 4px 4px 0 0;
            //color: var(--theme-color);
            font-weight: 500;
        }

        .underline {
            background-color: #000000;
            border-radius: 292px;
            position: absolute;
            bottom: 0;
            // transition: left 0.3s ease-in-out;
            box-sizing: border-box;
            height: 2px;
            z-index: 1;
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
    //box-shadow: -4px 0px 8px rgba($color: #000000, $alpha: 0.05);
    width: 16px;
    height: 44px;
    border-radius: 8px 0px 0px 8px;
    opacity: 1;
    box-sizing: border-box;
    border: 1px solid #F0F0F0;
    padding: 14px 0;

    >.svg {
        width: 16px;
        height: 16px;
    }
}

.tab-lable {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #fff;
}
</style>