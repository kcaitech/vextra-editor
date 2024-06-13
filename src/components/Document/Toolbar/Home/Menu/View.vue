<script setup lang="ts">
import ViewSubMenu from './ViewSubMenu.vue';
import { ref, reactive } from 'vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { XY } from '@/context/selection';
import SvgIcon from "@/components/common/SvgIcon.vue";

const { t } = useI18n();

interface Props {
    context: Context,
    site?: { x: number, y: number }
}

// interface Emits {
//     (e: 'rename'): void;
// }

const props = defineProps<Props>();
// const emit = defineEmits<Emits>();
const popoverVisible = ref<boolean>(false);
const childMenuVisible = ref<boolean>(false);
const childMenuPosition: XY = reactive({ x: 0, y: 0 });

function showChildFileMenu(e: MouseEvent) {
    childMenuPosition.x = (e.target as Element).getBoundingClientRect().width;
    childMenuPosition.y = -10;
    childMenuVisible.value = true
}

const closeChildFileMenu = () => {
    childMenuVisible.value = false
}

function close() {
    childMenuVisible.value = false;
    popoverVisible.value = false;
}


</script>
<template>

    <span @mouseenter="(e: MouseEvent) => showChildFileMenu(e)" @mouseleave="closeChildFileMenu">
        {{ t('fileMenu.view') }}
        <div class="childMenu">
            <!--                    <div class="triangle"></div>-->
            <svg-icon icon-class="arrowhead"></svg-icon>
            <ViewSubMenu v-if="childMenuVisible" :context="props.context" :x="childMenuPosition.x"
                :y="childMenuPosition.y" :width="180" :site="site" @close="close"></ViewSubMenu>
        </div>
    </span>

</template>
<style scoped lang="scss">
.childMenu {

    >svg {
        height: 16px;
        width: 16px;
        margin-right: 8px;
        margin-left: 60px;
        margin-top: 4px;
    }
}
</style>