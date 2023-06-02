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
import * as user_api from '@/apis/users'
import { User } from '@/context/user'
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const title = ref<string>(t('home.recently_opened'));
const getUserInfo = async () => {
  const result = await user_api.GetInfo()
  const user = new User(result.data);
  (window as any).skuser = user;
}

function setTitle(t: string) {
  title.value = t;
}

onMounted(async () => {
  getUserInfo()
})
</script>

<style lang="scss" scoped></style>