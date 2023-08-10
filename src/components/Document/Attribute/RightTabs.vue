<script setup lang="ts">
import { ref } from "vue";
import { Context } from "@/context";
import Design from "@/components/Document/Attribute/Design.vue";
import CompsTab from "@/components/Document/Navigation/CompsTab.vue";
import ResourceTab from "@/components/Document/Navigation/ResourceTab.vue";
import { useI18n } from 'vue-i18n';
import { Perm } from "@/context/workspace";
const { t } = useI18n();

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

function toggle(id: Tab) {
    if (id === 'Design') {
        if (props.context.selection.selectedShapes.length === 1) {
            props.context.selection.selectShape(props.context.selection.selectedShapes[0]);
        }

    }
    currentTab.value = id;
}

const showHiddenRight = () => {
    emit('showAttrbute')
}

</script>

<template>
    <div class="tab-container">
        <div class="controller">
            <div :class="{ tab: true, active: currentTab === i.id }" v-for="(i, index) in tabs" :key="index"
                @click="toggle(i.id)">{{ i.title }}</div>
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
    </div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;
    box-shadow: -4px 0px 4px rgba($color: #000000, $alpha: 0.05);

    .controller {
        height: 32px;
        width: 100%;
        flex: 0 0 auto;
        display: flex;
        flex-direction: row;
        margin-left: 13px;

        >.tab {
            font-weight: var(--font-default-bold);
            font-size: 10px;
            min-width: 36px;
            margin-right: 4px;
            margin-top: 4px;
            text-align: left;
            line-height: 24px;
            color: var(--grey-dark);
        }

        >.tab:hover {
            color: var(--theme-color);
        }

        >.active {
            border-radius: 4px 4px 0 0;
            color: var(--theme-color);
        }
    }

    .body {
        border-top: 1px solid var(--theme-color);
        width: 100%;
        height: calc(100% - 36px);
        position: relative;
        flex: 1 1 auto;
        box-sizing: border-box;
        .showHiddenR {
            position: absolute;
            left: -12px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 9;
            cursor: pointer;
            height: 60px;
            background-color: var(--theme-color-anti);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px 0px 0px 4px;
            box-shadow: -4px 0px 8px rgba($color: #000000, $alpha: 0.05);

            >.svg {
                width: 12px;
                height: 12px;
            }
        }
    }
}
</style>