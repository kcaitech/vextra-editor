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
          <Main />
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
import { ref, nextTick, reactive, onMounted } from 'vue';
import { importDocument, Repository } from "@kcdesign/data";
import { importSketch } from "@kcdesign/data/io";
import { router } from "@/router";

const getUserInfo = async () => {
  const result = await user_api.GetInfo()
  const user = new User(result.data);
  (window as any).skuser = user;
}

const importDocumentTest = () => {
  importDocument({
    endPoint: "http://192.168.0.10:9000",
    region: "zhuhai-1",
    accessKey: "MUFUQLKG1RTQEP3UORVQ",
    secretKey: "vooG087IpqRAKvCK8h39LZ1eAiUGULnx7S4BkUbm",
    sessionToken: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJNVUZVUUxLRzFSVFFFUDNVT1JWUSIsImV4cCI6MTcxNTMxMTg3NywicGFyZW50IjoiR2F0aG9vaDg4bWJhNUgzeTEiLCJzZXNzaW9uUG9saWN5IjoiZXlKVGRHRjBaVzFsYm5RaU9sdDdJa0ZqZEdsdmJpSTZXeUp6TXpwSFpYUlBZbXBsWTNRaVhTd2lSV1ptWldOMElqb2lRV3hzYjNjaUxDSlNaWE52ZFhKalpTSTZXeUpoY200NllYZHpPbk16T2pvNlpHOWpkVzFsYm5RdktpSmRmVjBzSWxabGNuTnBiMjRpT2lJeU1ERXlMVEV3TFRFM0luMD0ifQ.ZRjWQbVB4YbBTKoGxOt0fopQ0YnD2VzUK7sKS5glBnvi0yoEKAyISqR1ymfQJpOY02AGYUECtmBD0aX4eZvQrA",
    bucketName: "document"
  }, "9a2554b6-ad73-4505-afd3-878974e2771d", "", "").then((document) => {
    console.log(document);
    const repo = new Repository();
    window.document.title = document.name;
    (window as any).skrepo = repo;
    (window as any).sketchDocument = document;
    router.push({ name: 'document' });
  }).catch((err) => {
    console.log(err);
  })
}

onMounted(async () => {
  getUserInfo()
  // const resavatar = await user_api.GetInfo()
  // localStorage.setItem('avatar', resavatar.data.avatar)
  // localStorage.setItem('nickname', resavatar.data.nickname)

  // setTimeout(() => {
  //     importDocumentTest()
  // }, 2000)
})
</script>

<style lang="scss" scoped></style>