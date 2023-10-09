<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ComponentCollapseItem from './ComponentCollapseItem.vue';
import { Context } from '@/context';
import { SymbolListItem } from '@/utils/symbol';
interface Props {
    context: Context
    title: string
    data: SymbolListItem[]
    extend: boolean
}
const fold = ref<boolean>(true);
const props = defineProps<Props>();
function toggle() {
    fold.value = !fold.value;
}
onMounted(() => {
    if (props.extend) toggle();
})
</script>
<template>
    <div class="component-lib-collapse" @click="toggle">
        <div class="component-lib-collapse-title">
            <span>{{ props.title }}</span>
            <div class="shrink">
                <svg-icon icon-class="down" :style="{ transform: fold ? 'rotate(-90deg)' : 'rotate(0deg)' }"></svg-icon>
            </div>
        </div>
        <div class="component-lib-collapse-content" v-show="!fold" @click.stop>
            <ComponentCollapseItem v-for="(item, index) in props.data" :title="item.title" :data="item"
                :key="`${item.id}${index}`" :context="props.context">
            </ComponentCollapseItem>
        </div>
    </div>
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
        padding: 0 4px;
        box-sizing: border-box;
        position: relative;

        >span {
            font-weight: 600;
        }

        .shrink {
            position: absolute;
            right: 0px;
            height: 14px;
            width: 14px;

            >svg {
                width: 80%;
                height: 80%;
            }
        }
    }

    .component-lib-collapse-title:hover {
        background-color: var(--grey-light);
    }

    .component-lib-collapse-content {
        width: 100%;

        .temp {
            height: 28px;
            width: 100%;
            background-color: aliceblue;
        }
    }
}
</style>