<template>
    <div class="common-layout">
      <el-container>
        <el-aside width="381px"><Aside/></el-aside>
        <el-container>
          <el-header><Header/></el-header>
          <el-main><Main/></el-main>
        </el-container>
      </el-container>
    </div>
</template>
  

<script setup lang="ts">
import Aside from './Aside.vue';
import Header from './Header.vue';
import Main from './Main.vue';
import { defineProps, ref, nextTick, reactive, defineEmits } from 'vue';


</script>

<style lang="scss" scoped>

</style>