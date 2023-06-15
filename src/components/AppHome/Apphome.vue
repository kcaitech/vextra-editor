<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="381px">
        <Aside @settitle="setTitle" />
      </el-aside>
      <el-container>
        <el-header>
          <Header />
        </el-header>
        <el-main>
          <Main :title="title" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<script setup lang="ts">
import Aside from './Aside.vue';
import Header from './Header.vue';
import Main from './Main.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const title = ref<any>(sessionStorage.getItem('title') ? sessionStorage.getItem('title') : t('home.recently_opened'));

function setTitle(t: string) {
  title.value = t;
  sessionStorage.setItem('title', title.value)
}

</script>

<style lang="scss" scoped></style>