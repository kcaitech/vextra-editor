<script setup lang="ts">
import { ref } from 'vue'

</script>

<template>
     <el-card class="box-card">
    <!-- 标题 -->
    <template #header>
      <div class="card-header">
        <span>通知消息</span>
        <el-button class="button" text>
          <div class="close"> X </div>
        </el-button>
      </div>
    </template>
    <div class="contain">
        <el-scrollbar height="400px" style="padding-right: 10px;">
            <div class="inform-item" v-for="i in 10" :key="i">
                <div class="avatar"><img src="@/assets/avatar.png" alt=""></div>
                <div class="item-container">
                    <div class="item-title">
                        <span>张三</span>
                        <span>12：12</span>
                    </div>
                    <div class="item-text">
                        申请文档 "页面顺序调整" 只读权限 【备注】给我同意！！！！！！！！！！！！！！！！！！！！！！
                    </div>
                </div>
                <div class="botton">
                    <el-button color="#0d99ff" size="small">同意</el-button>
                    <el-button plain size="small" style="margin-top: 5px;">拒绝</el-button>
                </div>
            </div>
            <!-- <div class="text"><span>未收到任何消息</span></div> -->
        </el-scrollbar>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
::v-deep .el-card__header {
  border-bottom: none;
  padding: var(--default-padding-half) var(--default-padding);
  padding-bottom: 0;
}
::v-deep .el-card__body {
  padding: var(--default-padding-half) var(--default-padding-quarter) var(--default-padding-half) var(--default-padding);
}
::v-deep .el-button+.el-button {
    margin-left: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 14px;
    font-weight: var(--font-default-bold);
  }

  .close {
    font-size: 14px;
    color: black;
  }

}
.contain {
    font-size: var(--font-default-fontsize);
    .scrollbar-demo-item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 50px;
        margin: 10px;
        text-align: center;
        border-radius: 4px;
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        
    }   
}
.inform-item {
    width: 100%;
    height: 80px;
    display: flex;
    padding-bottom: var(--default-padding-half);
    .botton {
        width: 45px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
}
.text {
    width: 100%;
    height: 300px;
    display: flex;
    color: #999;
    justify-content: center;
    align-items: center;
}
.avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #efefef;
    margin-top: 5px;
    >img {
        width: 80%;
        height: 80%;
    }
}
.item-container {
    width: 180px;
    padding: var(--default-padding-half);
    .item-title {
        display: flex;
        justify-content: space-between;
    }
    .item-text {
        margin-top: 5px;
        width: 180px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
    }
}
.box-card {
  width: 300px;
  position: absolute;
  top: 40px;
  right: 0;
}
</style>