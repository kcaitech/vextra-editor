<template>
    <div class="nav">
        <div class="home"><el-icon size="25">
                <House />
            </el-icon><span>返回首页</span></div>
        <div class="close" @click="router.push({ path: '/apphome' })"><el-icon size="25">
                <Close />
            </el-icon></div>
    </div>

    <h1>个人中心</h1>
    <div class="icon">
        <span class="jbxx">基本信息</span>
        <div class="one">
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
                <a href="" class="btn" @click.prevent="openDialog">修改头像</a>
            </div>
        </div>
        <div class="one">
            <div class="two">
                <div class="three">
                    <div class="text">
                        <span style="font-size: 14px;font-weight: bold;">用户名</span>
                        <span style="font-size: 12px;color: #b3b3b3;" v-if="shownicknameinput">{{ uname }}</span>
                        <input class="newname" type="text" :value="uname" @change="newname" @blur="shownicknameinput = true"
                            v-else />
                    </div>
                </div>
                <a href="" class="btn" @click.prevent="shownicknameinput = false">编辑用户名</a>
            </div>
        </div>
        <div class="one">
            <div class="two">
                <div class="three">
                    <div class="text">
                        <span style="font-size: 14px;font-weight: bold;">用户ID</span>
                        <span style="font-size: 12px;color: #b3b3b3;">{{ id }}</span>

                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { reactive, toRefs, ref } from 'vue'
import { House, Close } from '@element-plus/icons-vue'
import { router } from '@/router';
import * as user_api from '@/apis/users'
import { ElMessage, inputEmits } from 'element-plus';

const shownicknameinput = ref(true)

const state = reactive({
    circleUrl: localStorage.getItem('avatar'),
    uname: localStorage.getItem('nickname'),
    id: localStorage.getItem('id')
})
const { circleUrl, uname, id } = toRefs(state)

const errorHandler = () => true

function openDialog() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.jpg, .png, .jpeg'
    input.addEventListener('change', handleFileSelected)
    input.click()

}

async function handleFileSelected(event: any) {
    const file = event.target.files[0]
    const fileName = file.name
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
    const allowedFormats = ['.jpg', '.png', '.jpeg']
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    try {
        if (file && file.size <= maxSizeInBytes && allowedFormats.includes(fileExtension)) {
            const formData = new FormData()
            formData.append('file', file)
            const { code, data: { avatar } } = await user_api.Setusericon(formData)
            if (code == 0) {
                localStorage.setItem('avatar', avatar)
                location.reload()
            } else {
                ElMessage.error('上传失败')
            }
        } else {
            // 文件大小超出限制
            ElMessage.error('文件大小或格式超出限制')
        }
    } catch (error) {
        ElMessage.error('请检测网络是否正常')
    }

}


async function newname() {
    const name: any = document.querySelector('.newname')
    const pattern = /^.{1,12}$/
    if (pattern.test(name.value)) {
        try {
            const { code } = await user_api.Setusernickname({ nickname: name.value })
            if (code == 0) {
                ElMessage.success('用户已修改')
                localStorage.setItem('nickname',name.value)
                location.reload()
            } else {
                ElMessage.error('用户名修改失败')
            }
        } catch (error) {
            ElMessage.error('请检测网络是否正常')
        }
    }else{
        ElMessage.error('请输入6-12个字符')
    }

}

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

    .close:hover {
        color: rgb(69, 69, 255);
    }
}

h1 {
    text-align: center;
    letter-spacing: 5px;
}

.icon {
    position: absolute;
    top: 15%;
    left: 50%;
    padding: 20px;
    transform: translate(-50%);
    box-sizing: border-box;
    border-radius: 5px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

    .jbxx {
        display: inline-block;
        font-weight: bold;
        margin-bottom: 20px;
        
    }

    .one {
        width: 800px;
        height: auto;
        padding: 0px 20px;
        margin-bottom: 20px;

        .two {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .three {
                display: flex;
                flex-direction: row;
                align-items: center;

                .tx {
                    display: flex;
                    margin-right: 10px;
                }

                .text {
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;

                }
            }
        }

        .btn {
            font-size: 14px;
            width: auto;
            height: 40px;
            line-height: 40px;
            color: rgb(55, 65, 252);
            text-decoration: none
        }
    }
}
</style>
