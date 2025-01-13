<script setup lang="ts">
import select_icon from "@/assets/icons/svg/select.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";

defineProps<{ check: boolean }>();
const emits = defineEmits<{
    (e: 'change'): void;
}>();
</script>
<template>
    <div :class="`display ${check ? 'visibility' : 'hidden'}`" @click="emits('change')">
        <SvgIcon v-if="check" :icon="select_icon"/>
    </div>
</template>
<style lang="scss" scoped>
div {
    width: 14px;
    height: 14px;
    border-radius: 4px;
}

.visibility {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--active-color);
    color: #ffffff;

    > img {
        width: 60%;
        height: 60%;
    }
}

.hidden {
    background: #FFFFFF;
    border: 1px solid #EBEBEB;
    box-sizing: border-box;
}

</style>