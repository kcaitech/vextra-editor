<template>
    <div id="top"></div>
    <div id="center">
        <div id="navigation"></div>
        <div id="content"></div>
        <div id="attributes"></div>
    </div>
    <div id="bottom"></div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import PageView from './components/PageView.vue';

// @Options({
//     components: {
//         PageView,
//     },
// })
export default class App extends Vue {
    
}
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
        overflow: auto;
    }
    #attributes {
        flex-flow:column nowrap;
        width:100px;
        height:auto;
    }
</style>
