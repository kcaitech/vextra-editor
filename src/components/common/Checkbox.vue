<script setup lang="ts">
import { defineProps, defineEmits, onMounted } from 'vue';
export type Item = { value: string, label: string };
const props = defineProps<{
    box: Item[],
    value: string[]
}>();

const value: string[] = JSON.parse(JSON.stringify(props.value));

const emits = defineEmits<{
    (e: 'change', value: string[]): void;
}>();

function check(b: Item) {
    console.log('-b-', b);
    if (isActive(b)) {
        const idx = value.findIndex(i => i === b.value);
        value.splice(idx, 1);
    } else {
        value.push(b.value);
    }
    emits('change', value);
}

function isActive(b: Item): boolean {
    return value.includes(b.value);
}

onMounted(() => {
    
})

</script>
<template>
    <div class="checkbox-container">
        <div
            :class="{item: true, active: isActive(b)}"
            v-for="(b, idx) in props.box"
            :key="idx"
            @click="check(b)"
        >
            <div class="box">
                <svg-icon v-if="isActive(b)" icon-class="select"></svg-icon>
            </div>
            <div class="label">{{ b.label }}</div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.checkbox-container {
    display: flex;
    > .item {
        display: flex;
        align-items: center;
        > .box {
            margin-left: 4px;
            width: 16px;
            height: 16px;
            border: 1px solid var(--coco-grey);
            border-radius: 3px;
            display: flex;
            justify-content: center;
            align-items: center;
            > svg {
                width: 80%;
                height: 80%;
            }
        }
        > .label {
            margin-left: 4px;
        }
    }
    > .active {
        background-color: #2561D9;
    }
}
</style>