<script setup lang="ts">
import ComponentListView from './ComponentListView.vue';
import { onMounted, ref } from 'vue';
import { Context } from '@/context';
import { SymbolListItem } from '@/utils/symbol';
import ComponentCollapseItemTitle from './ComponentCollapseItemTitle.vue';

interface Props {
    context: Context
    title: string
    data: SymbolListItem
    container: Element | null
}
const fold = ref<boolean>(true);
const props = defineProps<Props>();
function toggle() {
    fold.value = !fold.value;
    props.context.component.set_list_status(props.data.id);
}
function init() {
    if (!props.data.isFolder) return;
    const status = props.context.component.list_status;
    fold.value = !status.has(props.data.id);
}
onMounted(init);
</script>
<template>
    <div v-if="props.data.isFolder" class="component-lib-collapse" @click.stop="toggle">
        <div class="component-lib-collapse-title">
            <div class="triangle">
                <div :class="fold ? 'triangle-right' : 'triangle-down'"></div>
            </div>
            <ComponentCollapseItemTitle :data="props.data"></ComponentCollapseItemTitle>
        </div>
    </div>
    <ComponentListView v-else :context="props.context" :data="props.data.symbols" :container="props.container">
    </ComponentListView>
</template>
<style scoped lang="scss">
.component-lib-collapse {
    .component-lib-collapse-title {
        width: 100%;
        height: 28px;
        transition: 0.1s;
        border-radius: 4px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        position: relative;

        >.triangle {
            width: 12px;
            min-width: 12px;
            height: 100%;
            position: relative;

            >div {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            >.triangle-right {
                width: 0;
                height: 0;
                border-left: 5px solid #c0c0c0;
                border-top: 3px solid transparent;
                border-bottom: 3px solid transparent;
            }

            >.triangle-down {
                width: 0;
                height: 0;
                border-top: 5px solid var(--theme-color);
                border-left: 3px solid transparent;
                border-right: 3px solid transparent;
            }
        }
    }

    .component-lib-collapse-title:hover {
        background-color: var(--grey-light);
    }
}
</style>