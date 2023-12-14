<script lang="ts" setup>
import {Shape, ShapeType} from "@kcdesign/data";
import {onMounted, ref} from "vue";

interface Props {
    data: Shape
}

const props = defineProps<Props>();

const slices = ref<string[]>([]);

function montage() {
    slices.value.length = 0;
    let p = props.data.parent;
    while (p && p.type !== ShapeType.Symbol) {
        slices.value.unshift(p.name);
        p = p.parent;
    }

}
onMounted(montage);
</script>
<template>
    <div class="wrapper">
        <div v-for="(s, i) in slices" :key="i" class="prefix">
            <div>{{ s }}</div>
            <div class="split"> / </div>
        </div>
        <div>{{ props.data.name }}</div>
    </div>
</template>
<style scoped lang="scss">
.wrapper {
    display: flex;
    align-items: center;
    >.prefix{
        display: flex;
        align-items: center;
        color: var(--grey-dark);
        >div {
            white-space: pre;
        }
        >.split {
            font-weight: 900;
        }
    }
    font-size: var(--font-default-fontsize);
}
</style>