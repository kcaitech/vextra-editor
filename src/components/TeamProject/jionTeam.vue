<template>
<div>
    test
</div>

</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route=useRoute()

onMounted(()=>{
   console.log(route.query.temid);
   
})
</script>
<style lang="scss" scoped>


</style>
