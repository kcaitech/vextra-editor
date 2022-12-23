<script setup lang="ts">
import { getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
function onClick(e: Event) {
    e.stopPropagation();
    proxy?.$emit("openlocalfile");
}
function onClickRemote(e: Event) {
    e.stopPropagation();
    proxy?.$emit("openremotefile");
}
</script>

<template>
    <div>
        <button v-on:click="onClick">{{ $t("home.open_local_file") }}</button>
        <button v-on:click="onClickRemote">{{ $t("home.open_remote_file") }}</button>
    </div>
</template>

<style scoped>
div {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
}

button {
    width: 200px;
    height: 100px;
}
</style>