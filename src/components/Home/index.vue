<script setup lang="ts">
import { getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
function onClick(e: Event) {
    e.stopPropagation();
    proxy?.$emit("openlocalfile");
}
</script>

<template>
    <div>
        <button v-on:click="onClick">{{ $t("home.open_local_file") }}</button>
    </div>
</template>

<style scoped>
div {
    width: 100%;
    height: 100%;
}

button {
    width: 200px;
    height: 100px;
    position: relative;
    left: 50%;
    top: 50%;
    margin-left: -100px;
    margin-top: -50px;
}
</style>