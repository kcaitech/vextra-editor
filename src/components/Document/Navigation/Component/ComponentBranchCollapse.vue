<script setup lang="ts">
import { ref } from 'vue';

interface Props {
    title: string
}
const fold = ref<boolean>(false);
const props = defineProps<Props>();
function toggle() {
    fold.value = !fold.value;
}
</script>
<template>
    <div class="component-lib-collapse" @click="toggle">
        <div class="component-lib-collapse-title">
            <span>{{ props.title }}</span>
            <div class="shrink" @click.stop="toggle">
                <svg-icon icon-class="down" :style="{ transform: fold ? 'rotate(-90deg)' : 'rotate(0deg)' }"></svg-icon>
            </div>
        </div>
        <div class="component-lib-collapse-content" v-show="!fold">

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