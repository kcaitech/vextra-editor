<script setup lang="ts">
import { onMounted, ref } from "vue";

const firstInput = ref<HTMLInputElement>();
const { name, desc, focusAtOnce } = defineProps<{
    name: string;
    desc: string;
    focusAtOnce?: boolean;
}>();
const emits = defineEmits(["modifyName", "modifyDesc", "changeInput"]);

function blur(event: KeyboardEvent) {
    (event.target as HTMLInputElement).blur();
}

function modifyName(event: Event) {
    const target = event.target as HTMLInputElement;
    emits("modifyName", (event.target as HTMLInputElement).value);
    target.blur();
}

function modifyDesc(event: Event) {
    const target = event.target as HTMLInputElement;
    emits("modifyDesc", (event.target as HTMLInputElement).value);
    target.blur();
}

function changeInput(event: Event) {
    emits("changeInput", (event.target as HTMLInputElement).value);
}

onMounted(() => {
    if (focusAtOnce) {
        firstInput.value!.focus();
        firstInput.value!.select();
    }
});
</script>
<template>
    <div class="detail">
        <div class="name">
            <label for="name">名称</label>
            <input ref="firstInput" type="text" id="name" :value="name" @change="modifyName" @input="changeInput"
                @keydown.esc="blur">
        </div>
        <div class="des">
            <label for="des">描述</label>
            <input type="text" id="des" :value="desc" @change="modifyDesc" @keydown.esc="blur">
        </div>
    </div>
</template>
<style scoped lang="scss">
.detail {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 12px;
    box-sizing: border-box;

    .name,
    .des {
        display: flex;
        align-items: center;
        height: 32px;
        gap: 8px;

        input {
            flex: 1;
            outline: none;
            font-size: 12px;
            padding: 10px 8px;
            height: 32px;
            border-radius: 6px;
            border: 1px solid transparent;
            background-color: #F5F5F5;
            box-sizing: border-box;

            &:focus {
                border: 1px solid #1878f5;
            }
        }
    }
}
</style>