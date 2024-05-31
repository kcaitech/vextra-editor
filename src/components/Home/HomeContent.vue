<template>
    <AgreementBaseComponent>
        <div class="main-content">
            <div class="start">
                <div class="content">
                    <div class="title">随时都可写 什么都能画</div>
                    <!-- <div class="title"><img :src="start" alt="title"></div> -->
                    <div class="description">专业UI设计软件，同时支持团队管理、文档演示以及多人协作，
                        <br>
                        让每一个参与者都能高效参与的设计工具</div>
                    <div class="login" @click.stop="router.push({ name: 'login' })">免费体验</div>
                </div>
            </div>
            <div class="moss-container">
                <div class="moss">
                    <div class="content">
                        <img class="bg" :src="softui" alt="UI">
                        <!-- <img class="bg-1" :src="zjk" alt="zujianku">
                    <img class="bg-2" :src="tc" alt="tianchong">
                    <img class="bg-3" :src="dc" alt="daochu"> -->
                    </div>
                </div>
            </div>
            <div class="design-container">
                <div class="design">
                    <div class="lunbo">
                        <img :src="gangbi" alt="gangbi">
                        <img :src="zjgn" alt="zjgn">
                        <img :src="gsjr" alt="gsjr">
                    </div>
                    <div class="wenan">
                        <div class="title">专业UI设计功能</div>
                        <!-- <div class="title"><img :src="design" alt="title"></div> -->
                        <div class="description">专业的矢量编辑工具，满足精细化编辑；高效的组件功能，
                            <br>
                            并且兼容Sketch、Figma(<span>开发中，敬请期待</span>)等主流文件格式，
                            <br>
                            无缝进行文件迁移</div>
                        <div class="login" @click.stop="router.push({ name: 'login' })">立即免费体验</div>
                    </div>
                </div>
            </div>
            <div class="cooperation-container">
                <div class="cooperation">
                    <div class="image">
                        <img :src="cooperation" alt="cooperation">
                    </div>
                    <div class="content">
                        <div class="title">团队实时协作</div>
                        <div class="description">链接邀请，在线实时协同，随时都能获取最新稿件；
                            <br>
                            文档定点评论，高效沟通，让思维随时碰撞出新的火花；
                            <br>
                            设计师轻松交付，切图资源、布局参数，工程师信手拈来</div>
                        <div class="login" @click.stop="router.push({ name: 'login' })">立即免费体验</div>
                    </div>
                </div>
            </div>
            <div class="platform-container">
                <div class="platform">
                    <div class="top">
                        <div class="title">跨终端 无缝衔接</div>
                        <div class="description">多端数据实时同步，随时随地编辑创作</div>
                    </div>
                    <div class="bottom">
                        <img :src="kuaduan" alt="kuaduan">
                    </div>
                </div>
            </div>
            <div class="end">
                <div class="content">
                    <div class="title">每个参与者都能高效参与的设计工具</div>
                    <div class="login" @click.stop="router.push({ name: 'login' })">免费体验</div>
                </div>
            </div>
        </div>
    </AgreementBaseComponent>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import softui from '@/assets/moss-ui.svg'
import gangbi from '@/assets/des-gb.svg'
import cooperation from '@/assets/cooperation.svg'
import kuaduan from '@/assets/kuaduan.svg'
import zjgn from '@/assets/zjgn.svg'
import gsjr from '@/assets/gsjr.svg'
import AgreementBaseComponent from '@/components/Login/AgreementBaseComponent.vue';
import { router } from '@/router';

onMounted(() => {
    const els = document.querySelector(".design .lunbo")
    let i = 0
    setInterval(() => {
        if (i > 2) return i = 0
        els?.scrollTo({ top: 0, left: els.clientWidth * i - 1 })
        i++
    }, 3000)
})
</script>

<style lang="scss" scoped>
.main-content {
    display: flex;
    flex-direction: column;

    .moss-container,
    .design-container,
    .cooperation-container,
    .platform-container {
        display: flex;
        width: 100%;
        min-width: 1152px;
    }

    .moss-container {
        background-color: #F4F8FB;
        background-image: url("@/assets/softui-bg.svg");
        background-repeat: no-repeat;
        background-size: cover;
    }

    .design-container,
    .platform-container {
        background-color: #fff;
    }

    .cooperation-container {
        background-color: #F4F8FB;
    }
}

.start,
.end {
    display: flex;
    width: 100%;
    min-width: 1152px;

    .content {
        margin: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        height: 100%;
        max-width: 1440px;
        min-width: 1152px;

        .title {
            font-family: 'zihunbiantaoti';
            color: #1F1F1F;
        }

        .description {
            color: #262626;
            max-width: 560px;
            text-align: center;
            line-height: 27px;
        }

        .login {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 256px;
            min-height: 56px;
            border-radius: 10px;
            background-color: #1878F5;
            color: #fff;
            font-size: 18px;
            font-weight: 500;
        }
    }
}

.start {
    height: 313px;
    background-color: #F4F8FB;

    .content .title {
        margin-top: 48px;
        font-size: 72px;
    }

    .content .description {
        margin-top: 24px;
        font-size: 18px;
    }

    .content .login {
        margin-top: 45px;
    }
}

.moss,
.design,
.cooperation,
.platform {
    margin: auto;
    width: 100%;
    max-width: 1440px;
    height: 940px;
}

.moss {
    .content {
        width: 100%;
        height: 100%;

        .bg {
            width: 100%;
            height: 100%;
        }
    }
}

.design {
    display: flex;
    justify-content: center;
    align-items: center;

    .lunbo {
        width: 746px;
        height: 620px;
        display: flex;
        overflow-y: scroll;
        scroll-behavior: smooth;

        &::-webkit-scrollbar {
            display: none;
        }

        img {
            width: 100%;
            height: 100%;
        }

    }

    .wenan {
        width: 614px;
        height: 620px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 0 0 0 76px;
        box-sizing: border-box;

        .title {
            font-family: 'zihunbiantaoti';
            margin-top: 87px;
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
            position: relative;
            margin-top: 122px;
            font-size: 21px;
            font-weight: 500;
            line-height: 42px;
            color: #1878F5;

            &::after {
                content: "";
                position: absolute;
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-bottom: 10px solid #1878F5;
                transform: translateX(8px) translateY(17px) rotate(90deg);
                animation: huitan 3s infinite both;
            }
        }
    }

}

.cooperation {
    display: flex;
    flex-direction: row-reverse;
    justify-content: center;
    align-items: center;

    .image {
        width: 746px;
        height: 620px;
        box-sizing: border-box;

        img {
            width: 100%;
            height: 100%;
        }

    }

    .content {
        width: 614px;
        height: 620px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 0 76px 0 0px;
        box-sizing: border-box;

        .title {
            font-family: 'zihunbiantaoti';
            margin-top: 87px;
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
            position: relative;
            margin-top: 122px;
            font-size: 21px;
            font-weight: 500;
            line-height: 42px;
            color: #1878F5;

            &::after {
                content: "";
                position: absolute;
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-bottom: 10px solid #1878F5;
                transform: translateX(8px) translateY(17px) rotate(90deg);
                animation: huitan 3s infinite both;
            }
        }
    }
}

.platform {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;

    .top {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .title {
            font-family: 'zihunbiantaoti';
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
        width: 100%;
        height: 100%;
        max-width: 1360px;
        min-width: 1152px;
        max-height: 684px;
        min-height: 684px;


        img {
            width: 100%;
            height: 100%;
        }
    }
}

.end {
    height: 380px;
    background-image: url("@/assets/end-bg.svg");
    background-repeat: no-repeat;
    background-size: cover;

    .content .title {
        font-size: 68px;
    }

    .content .login {
        margin: 57px 0 103px 0;
    }
}


@keyframes huitan {
    0% {
        transform: translate(8px, 17px) rotate(90deg);
    }

    10% {
        transform: translate(14px, 17px) rotate(90deg);
    }

    20% {
        transform: translate(5px, 17px) rotate(90deg);
    }

    30% {
        transform: translate(14px, 17px) rotate(90deg);
    }

    40% {
        transform: translate(5px, 17px) rotate(90deg);
    }

    50% {
        transform: translate(8px, 17px) rotate(90deg);
    }
}


@media (max-width:1440px) {
    .main-content {

        .moss-container,
        .design-container,
        .cooperation-container,
        .platform-container {

            .moss,
            .design,
            .cooperation,
            .platform {
                max-width: 1200px;
                height: 784px;
            }

            .platform {
                height: 940px;
            }

            .design {
                .lunbo {
                    width: 662px;
                    height: 550px;
                }

                .wenan {
                    width: 538px;
                    height: 550px;
                    padding: 0 0 0 66px;


                    .title {
                        margin-top: 76px;
                        font-size: 60px;
                    }

                    .description {
                        margin-top: 28px;
                        font-size: 15px;
                        line-height: 30px;
                    }

                    .login {
                        margin-top: 106px;
                        font-size: 18px;
                    }
                }

            }

            .cooperation {


                .image {
                    width: 662px;
                    height: 550px;
                }

                .content {
                    width: 538px;
                    height: 550px;
                    padding: 0 66px 0 0px;

                    .title {
                        margin-top: 76px;
                        font-size: 60px;
                    }

                    .description {
                        margin-top: 28px;
                        font-size: 15px;
                        line-height: 30px;
                    }

                    .login {
                        margin-top: 106px;
                        font-size: 18px;
                    }
                }
            }

            .platform {
                .bottom {
                    width: 1152px;
                    height: 940px;
                }
            }
        }
    }

}

@media (max-width:1152px) {
    .main-content {

        .moss-container,
        .design-container,
        .cooperation-container,
        .platform-container {

            .moss,
            .design,
            .cooperation,
            .platform {
                min-width: 1072px;
                height: 700px;
            }

            .platform {
                height: 940px;
            }

            .design {
                .lunbo {
                    width: 596px;
                    height: 495px;
                }

                .wenan {
                    width: 484px;
                    height: 495px;
                    padding: 0 0 0 60px;


                    .title {
                        margin-top: 68px;
                        font-size: 54px;
                    }

                    .description {
                        margin-top: 26px;
                        font-size: 14px;
                        line-height: 30px;
                    }

                    .login {
                        margin-top: 96px;
                        font-size: 16.55px;
                    }
                }

            }

            .cooperation {


                .image {
                    width: 596px;
                    height: 495px;
                }

                .content {
                    width: 484px;
                    height: 495px;
                    padding: 0 60px 0 0px;

                    .title {
                        margin-top: 68px;
                        font-size: 54px;
                    }

                    .description {
                        margin-top: 26px;
                        font-size: 14px;
                        line-height: 30px;
                    }

                    .login {
                        margin-top: 96px;
                        font-size: 16.55px;
                    }
                }
            }

            .platform {
                .bottom {
                    width: 1152px;
                    height: 684px;
                }
            }
        }
    }

}
</style>
