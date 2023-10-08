<script setup lang="ts">
import ComponentListView from './ComponentListView.vue';
import { ref } from 'vue';
import { Context } from '@/context';
import { SymbolListItem } from '@/utils/symbol';

interface Props {
    context: Context
    title: string
    data: SymbolListItem
}
const fold = ref<boolean>(true);
const props = defineProps<Props>();
function toggle() {
    fold.value = !fold.value;
    props.context.component.set_list_action_target(props.data.id);
}
</script>
<template>
    <div v-if="props.data.isFolder" class="component-lib-collapse" @click.stop="toggle">
        <div class="component-lib-collapse-title">
            <div class="triangle">
                <div :class="fold ? 'triangle-right' : 'triangle-down'"></div>
            </div>
            <span>{{ props.title }}</span>
        </div>
    </div>
    <ComponentListView v-else :context="props.context" :data="props.data.symbols"></ComponentListView>
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