<template>
    <div id="top"></div>
    <div id="center">
        <div id="navigation"></div>
        <ContentView id="content"></ContentView>
        <div id="attributes"></div>
    </div>
    <div id="bottom"></div>
</template>

<script setup lang="ts">
import ContentView from './components/ContentView.vue';


</script>

<style scoped>
    #app {
        display: flex;
        flex-flow:column nowrap;
        width:100%;
        height:auto;
    }
    #top {
        flex-flow:row nowrap;
        width:100%;
        height:50px;
    }
    #center {
        display: flex;
        flex-flow:row nowrap;
        flex: 1 1 auto;
        width:100%;
        height:auto;
    }
    #bottom {
        flex-flow:row nowrap;
        width:100%;
        height:30px;
        align-self:flex-end;
        visibility: hidden;
    }
    #navigation {
        display: flex;
        flex-flow:column nowrap;
        width:100px;
        height:auto;
    }
    #content {
        flex: 1 1 auto;
        width:auto;
        height:auto;
        overflow: hidden;
    }
    #attributes {
        flex-flow:column nowrap;
        width:100px;
        height:auto;
    }
</style>
