<template>
  <div class="common-layout">
    <el-container>
      <el-header height="56" min-height="56">
        <Header :items="items" :title="searchtitle" />
      </el-header>
      <el-container>
        <el-aside width="260px" min-width="260px">
          <Aside @settitle="setTitle" />
        </el-aside>
        <el-main>
          <Main :title="title" @data-update="update" />
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
const searchtitle = ref('')
let items = ref<any[]>([])

function setTitle(t: string) {
  title.value = t;
  sessionStorage.setItem('title', title.value)
}

//===>接收到最新的lists,props传给Headher组件
const update = (data: any, title: any) => {
  items.value = data
  searchtitle.value = title
}


</script>

<style lang="scss" scoped>
.el-header{
  margin-top: 8px;
}
.el-main{
  padding-top: 0;
}
.el-aside {
  border-right: rgba(239, 239, 239, 0.838) solid 1px;
  transition: all .3s ease-in-out;
}

@media screen and (max-width:1000px) {
  .el-aside {
    width:60px;
  }

}
</style>