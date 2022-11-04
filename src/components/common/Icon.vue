<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{ valid: boolean, selected: boolean, onclick: Function, maskclass: string }>();

function getIconClass() {
    let cl = "icon";
    if (!props.valid) {
        cl += " invalid";
    }
    if (props.selected) {
        cl += ' selected'
    }
    cl += ' ' + props.maskclass;
    return cl;
}
</script>

<template>
    <div class="iconwrap" v-on:click="onclick()">
        <div v-if="selected" class="selected"></div>
        <div :class="getIconClass()" ></div>
    </div>
</template>

<style scoped>

div.iconwrap {
    position: relative;
    width: 20px;
    height: 20px;
}

div.icon {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: white;
}

div.icon:hover {
    background-color: blue;
}

div.selected {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: yellow;
}

div.icon.invalid {
    background-color: gray;
}

</style>