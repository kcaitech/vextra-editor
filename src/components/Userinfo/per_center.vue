<template>
    <div class="nav">
        <div class="home"><el-icon size="25">
                <House />
            </el-icon><span>返回首页</span></div>
        <div class="close" @click="router.push({path:'/apphome'})"><el-icon size="25">
                <Close />
            </el-icon></div>
    </div>

    <h1>个人中心</h1>
    <div class="icon">
        <span class="jbxx">基本信息</span>
        <div class="one" >
            <div class="two">
                <div class="three">
                    <div class="tx"><el-avatar :src="circleUrl" @error="errorHandler">
                            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                        </el-avatar></div>
                    <div class="text">
                        <span style="font-size: 14px;font-weight: bold;">头像</span>
                        <span style="font-size: 12px;color: #b3b3b3;">上传2M以内PNG或JPG格式图片</span>
                    </div>
                </div>
                <a href="" class="btn" @click.prevent="">修改头像</a>
            </div>
        </div>
        <div class="one" >
            <div class="two">
                <div class="three">
                    <div class="text">
                        <span style="font-size: 14px;font-weight: bold;">用户名</span>
                        <span style="font-size: 12px;color: #b3b3b3;">{{uname}}</span>
                    </div>
                </div>
                <a href="" class="btn" @click.prevent="">编辑用户名</a>
            </div>
        </div>
        <div class="one" >
            <div class="two">
                <div class="three">
                    <div class="text">
                        <span style="font-size: 14px;font-weight: bold;">用户ID</span>
                        <span style="font-size: 12px;color: #b3b3b3;">{{id}}</span>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import { House, Close } from '@element-plus/icons-vue'
import { router } from '@/router';


const state = reactive({
    circleUrl: localStorage.getItem('avatar'),
    uname: localStorage.getItem('nickname'),
    id:localStorage.getItem('id')
})
const { circleUrl, uname, id} = toRefs(state)

const errorHandler = () => true

</script>
<style lang="scss" scoped>
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px;

    .home {
        display: flex;
        align-items: center;
    }
    .close:hover{
        color: rgb(69, 69, 255); 
    }
}

h1 {
    text-align: center;
    letter-spacing: 5px;
}

.icon {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translate(-50%);
    box-sizing: border-box;
    .jbxx {
        display: inline-block;
        font-weight: bold;
        margin-bottom: 20px;
    }

    .one {
        width: 800px;
        height: auto;
        padding:0px 20px ;
        margin-bottom: 20px;
        .two{
            display: flex;
            justify-content: space-between;
            align-items: center;
            .three{
                display: flex;
                flex-direction: row;
                align-items: center;
                .tx{
                    display: flex;
                    margin-right: 10px;
                }
                .text{
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                    
                }
            }
      }
        .btn{
            font-size: 14px;
            width: auto;
            height: 40px;
            line-height: 40px;
            color: rgb(55, 65, 252);
            text-decoration:none
 
        }
    }
}
</style>
