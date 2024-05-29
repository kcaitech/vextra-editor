<template>
    <div class="main-content">
        <div class="top">
            <div class="content">
                <div class="title">随时都可写 什么都能画</div>
                <div class="description">专业UI设计软件，同时支持团队管理、文档演示以及多人协作，
                    让每一个参与者都能高效参与的设计工具</div>
                <div class="login">免费体验</div>
            </div>
        </div>
        <div class="moss">
            <div class="content">
                <img class="bg" :src="softui" alt="UI">
                <img class="bg-1" :src="zjk" alt="zujianku">
                <img class="bg-2" :src="tc" alt="tianchong">
                <img class="bg-3" :src="dc" alt="daochu">
            </div>

        </div>
        <div class="design">
            <div class="lunbo">
                <img :src="gangbi" alt="gangbi">
            </div>
            <div class="wenan">
                <div class="title">专业UI设计功能</div>
                <div class="description">专业的矢量编辑工具，满足精细化编辑；高效的组件功能，
                    并且兼容Sketch、Figma(<span>开发中，敬请期待</span>)等主流文件格式，无缝进行文件迁移</div>
                <div class="login">立即免费体验</div>
            </div>
        </div>
        <div class="cooperation">
            <div class="lunbo">
                <img :src="cooperation" alt="cooperation">
            </div>
            <div class="wenan">
                <div class="title">团队实时协作</div>
                <div class="description">链接邀请，在线实时协同，随时都能获取最新稿件；
                    文档定点评论，高效沟通，让思维随时碰撞出新的火花；
                    设计师轻松交付，切图资源、布局参数，工程师信手拈来</div>
                <div class="login">立即免费体验</div>
            </div>
        </div>
        <div class="platform">
            <div class="top">
                <div class="title">跨终端 无缝衔接</div>
                <div class="description">多端数据实时同步，随时随地编辑创作</div>
            </div>
            <div class="bottom">
                <img :src="kuaduan" alt="kuaduan">
            </div>
        </div>
        <div class="bottom">
            <div class="content">
                <div class="title">每个参与者都能高效参与的设计工具</div>
                <div class="login">免费体验</div>
            </div>
        </div>

        <!-- <div v-for="index in 5" :key="index" :class="'container'" :id="'container' + index">
            <div class="box-content" :id="'box-content' + index"></div>
        </div> -->
    </div>
    <!-- <div class="meun">
        <ul class="meunlist">
            <li v-for=" index in 5" :key="index" :class="{ select: selectid === ('#container' + index) }"
                @click="scrollToSection('#container' + index)"></li>
        </ul>
    </div> -->
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import softui from '@/assets/softui.svg'
import zjk from '@/assets/ui-zjk.svg'
import tc from '@/assets/ui-tc.svg'
import dc from '@/assets/ui-dc.svg'
import gangbi from '@/assets/des-gb.svg'
import cooperation from '@/assets/cooperation.svg'
import kuaduan from '@/assets/kuaduan.svg'

const selectid = ref('')
const Elements = ref<any>()

let timer: any
const scrollToSection = (selector: string) => {
    const targetElement = document.querySelector(selector)
    if (targetElement) {
        observer.disconnect() //停止观察，避免手动点击小圆点和观察回调命中小圆点的方法冲突，导致小圆点选中状态异常
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        selectid.value = selector
    }
    timer = setTimeout(() => {
        startObserving(Elements.value) //延迟0.5秒后重启观察
        clearTimeout(timer)
    }, 500);
}


let thresholdSets = [];

for (let i = 0; i <= 1.0; i += 0.01) {
    thresholdSets.push(i);
}

const RatioNumber = (num: number) => {
    switch (true) {
        case num >= 0.95:
            return 1;
        case num >= 0.85:
            return 0.9;
        case num >= 0.75:
            return 0.8;
        case num >= 0.65:
            return 0.7;
        case num >= 0.55:
            return 0.6;
        case num >= 0.45:
            return 0.5;
        case num >= 0.35:
            return 0.4;
        case num >= 0.25:
            return 0.3;
        case num >= 0.15:
            return 0.2;
        case num >= 0.05:
            return 0.1;
        default:
            return 0;
    }
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const el1 = document.querySelector('#box-content1')! as HTMLElement
        const el2 = document.querySelector('#box-content2')! as HTMLElement
        const el3 = document.querySelector('#box-content3')! as HTMLElement
        const el4 = document.querySelector('#box-content4')! as HTMLElement
        const el5 = document.querySelector('#box-content5')! as HTMLElement
        if (entry.target.id === 'container1') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el1.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`
            }
        }
        if (entry.target.id === 'container2') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el2.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`

            }
        }
        if (entry.target.id === 'container3') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el3.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`

            }
        }
        if (entry.target.id === 'container4') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el4.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`

            }
        }
        if (entry.target.id === 'container5') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el5.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`
            }
        }
        if (entry.intersectionRatio >= 0.5) {
            selectid.value = '#' + entry.target.id
        }
    });

}, { root: null, threshold: thresholdSets });

const startObserving = (elements: any) => {
    elements.forEach((el: any) => {
        if (el as HTMLElement) {
            observer.observe(el);
        }
    })
}

onMounted(() => {
    const containerElements = document.querySelectorAll('.container')
    startObserving(containerElements)
    Elements.value = containerElements
})
</script>

<style lang="scss" scoped>
.moss {}

.top,
.bottom {
    display: flex;
    width: 100%;
    // height: 313px;
    box-sizing: border-box;

    .content {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        margin: auto;

        .title {
            margin-top: 48px;
            font-size: 72px;
            color: #1F1F1F;

        }

        .title:nth-child(1) {
            font-size: 40px;
        }

        .description {
            font-size: 18px;
            color: #262626;
            margin-top: 24px;
            max-width: 560px;
            text-align: center;
        }

        .login {

            display: flex;
            align-items: center;
            justify-content: center;
            width: 256px;
            height: 56px;
            border-radius: 10px;
            background-color: #1878F5;
            color: #fff;
            font-size: 18px;
            font-weight: 500;
            margin-top: 45px;
        }

        .login:nth-child(1) {
            margin-bottom: 103px;
        }
    }
}

.top{
    background-color:#F4F8FB ;
}


.moss,
.design,
.cooperation,
.platform {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    .content {
        width: 100%;
        margin: 5% 15%;
        max-width: 1200px;
        position: relative;

        .bg {
            width: 100%;
        }

        .bg-1 {
            position: absolute;
            top: 2%;
            left: -27%;
            width: 45%;
        }

        .bg-2 {
            position: absolute;
            top: 1%;
            right: -25%;
            width: 45%;
        }

        .bg-3 {
            position: absolute;
            top: 32%;
            right: -27%;
            width: 45%;
        }
    }

    .lunbo,
    .wenan {
        width: 48%;
        max-width: 746px;

        img {
            width: 100%;
        }

        .title {
            font-size: 68px;
            font-weight: 400;
            color: #1F1F1F;
            white-space: nowrap;
        }

        .description {
            margin-top: 32px;
            font-size: 17px;
            line-height: 34px;
            color: #262626;

            span {
                color: #8C8C8C;
            }
        }

        .login {
            margin-top: 122px;
            font-size: 21px;
            font-weight: 500;
            color: #1878F5;
        }
    }

    .wenan {
        display: flex;
        flex-direction: column;
        margin: auto 0;
        padding: 0 3%;
        box-sizing: border-box;
    }

    .top {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .title {
            font-size: 68px;
            font-weight: 400;
            color: #1F1F1F;
        }

        .description {
            margin: 32px 0 24px 0;
            font-size: 19px;
            color: #262626;
        }
    }

    .bottom {
        width: 70%;
        max-width: 1360px;

        img {
            width: 100%;
        }
    }
}

.moss,.design,
.cooperation,
.platform {
    padding: 4% 0;
    background:#F4F8FB;
}
.design,.platform{
    background-color: #fff;
}

.cooperation {
    flex-direction: row-reverse;
    background-color: #F4F7FB;
}

.platform {
    flex-direction: column;
}



@media (max-width:1024px) {
    .top {
        .content {
            .title {
                font-size: 56px;
                margin-top: 32px;
            }

            .description {
                font-size: 18px;
            }


        }
    }

    .design,
    .cooperation {

        .lunbo,
        .wenan {
            width: 48%;

            .title {
                font-size: 48px;
                // margin-top: 20px;
            }

            .description {
                font-size: 16px;
            }

            .login {
                font-size: 18px;
                margin-top: 30px;
            }
        }
    }

    .platform {
        .top {
            .title {
                font-size: 56px;
            }

            .description {
                font-size: 18px;
            }
        }
    }
}

@media (max-width:800px) {
    .top {
        .content {
            .title {
                font-size: 40px;
                margin-top: 24px;
            }

            .description {
                font-size: 14px;
                max-width: 480px;
            }

            .login {
                font-size: 16px;
                height: 50px;
                width: 200px;
            }
        }
    }


    .design,
    .cooperation {
        flex-direction: column;

        .lunbo,
        .wenan {
            width: 96%;
            padding: 0;

            .title {
                font-size: 30px;
                margin-top: 20px;
            }

            .description {
                font-size: 14px;
            }

            .login {
                font-size: 16px;
                margin-top: 20px;
            }
        }
    }

    .platform {
        .top {
            .title {
                font-size: 40px;
            }

            .description {
                margin: 24px 0 12px 0;
                font-size: 16px;
            }
        }

        .bottom {
            width: 100%;
        }
    }
}


@media (max-width:480px) {
    .top {
        .content {
            .title {
                font-size: 30px;
                margin-top: 16px;
            }

            .description {
                font-size: 14px;
                max-width: 400px;
            }

            .login {
                margin-top: 30px;
                font-size: 16px;
                height: 40px;
                width: 120px;
            }
        }
    }

    .design,
    .cooperation {
        flex-direction: column;

        .lunbo,
        .wenan {
            width: 96%;
            padding: 0;

            .title {
                font-size: 30px;
                margin-top: 20px;
            }

            .description {
                font-size: 14px;
            }

            .login {
                font-size: 16px;
                margin-top: 20px;
            }
        }
    }

    .platform {
        .top {
            .title {
                font-size: 30px;
            }

            .description {
                margin: 24px 0 12px 0;
                font-size: 14px;
            }
        }

        .bottom {
            width: 100%;
        }
    }
}
</style>
