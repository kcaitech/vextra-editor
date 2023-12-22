<script setup lang="ts">
import ComponentListView from './ComponentListView.vue';
import { onMounted, ref } from 'vue';
import { Context } from '@/context';
import { SymbolListItem } from '@/utils/symbol';
import ComponentCollapseItemTitle from './ComponentCollapseItemTitle.vue';
import Position from "@/components/Document/Attribute/PopoverMenu/Position.vue";
import SvgIcon from "@/components/common/SvgIcon.vue";
import JionTeam from "@/components/TeamProject/jionTeam.vue";

interface Props {
    context: Context
    title: string
    data: SymbolListItem
    container: Element | null
    status_set: Set<string>
    isAttri: boolean
    cardType: 'alpha' | 'beta'
}
interface Emits {
    (e: 'change-status', id: string): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const fold = ref<boolean>(true);
function toggle() {
    fold.value = !fold.value;
    emits("change-status", props.data.id);
}
function init() {
    if (!props.data.isFolder) return;
    fold.value = !props.status_set.has(props.data.id);
}
onMounted(init);
</script>
<template>
    <div v-if="props.data.isFolder" class="component-lib-collapse" @click.stop="toggle">
        <div class="component-lib-collapse-title">
            <div class="triangle">
                <svg-icon :icon-class="fold ? 'triangle-right' : 'triangle-under'"></svg-icon>
            </div>
            <ComponentCollapseItemTitle :data="props.data"></ComponentCollapseItemTitle>
        </div>
    </div>
    <ComponentListView v-else :context="props.context" :data="props.data.symbols" :container="props.container" :is-attri="props.isAttri" :card-type="props.cardType">
    </ComponentListView>
</template>
<style scoped lang="scss">
.component-lib-collapse {
    .component-lib-collapse-title {
        width: 100%;
        height: 32px;
        transition: 0.1s;
        border-radius: 4px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        position: relative;
        padding: 9px 0 9px 12px;

        >.triangle {
            width: 14px;
            min-width: 14px;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 4px;

            //>div {
            //    position: absolute;
            //    left: 50%;
            //    top: 50%;
            //    transform: translate(-50%, -50%);
            //}

            >svg {
                width: 14px;
                height: 14px;
                //border-left: 5px solid #c0c0c0;
                //border-top: 3px solid transparent;
                //border-bottom: 3px solid transparent;
                //transform: translate(-50%, -50%);
            }

            //>.triangle-down {
            //    width: 0;
            //    height: 0;
            //    border-top: 5px solid var(--theme-color);
            //    border-left: 3px solid transparent;
            //    border-right: 3px solid transparent;
            //}
        }
    }

    //.component-lib-collapse-title:hover {
    //    background-color: var(--grey-light);
    //}
}
</style>