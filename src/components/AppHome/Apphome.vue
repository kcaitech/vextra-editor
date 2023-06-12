<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="381px">
        <Aside />
      </el-aside>
      <el-container>
        <el-header>
          <Header />
        </el-header>
        <el-main>
          <Main/>
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
import {User} from '@/context/user'
import {onMounted} from 'vue';

const getUserInfo = async () => {
    const result = await user_api.GetInfo()
    const user = new User(result.data);
    (window as any).skuser = user;
}

onMounted(async () => {
    getUserInfo()
    const resavatar = await user_api.GetInfo()
    localStorage.setItem('avatar', resavatar.data.avatar)
    localStorage.setItem('nickname', resavatar.data.nickname)

    // setTimeout(() => {
    //     importDocumentTest()
    // }, 2000)
})
</script>

<style lang="scss" scoped></style>