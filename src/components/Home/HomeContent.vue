<template>
    <AgreementBaseComponent>
        <div class="main-content">
            <div class="start">
                <div class="content">
                    <div class="title">{{ t("start.title") }}</div>
                    <!-- <img src="../../assets/slogan.svg" alt="slogan"> -->
                    <div class="description">
                        {{ t("start.description_1") }}
                        {{ t("start.description_2") }}
                    </div>
                    <div class="login" @click.stop="router.push({ name: 'login' })">{{ t("pub.login_1") }}</div>
                </div>
            </div>
            <div class="moss-container">
                <div class="moss">
                    <div class="content">
                        <picture>
                            <source media="(max-width:480px)" srcset="@/assets/moss-ui.png">
                            <img class="bg" :src="softui" alt="UI" loading="eager">
                        </picture>
                    </div>
                </div>
            </div>
            <div class="design-container">
                <div class="design">
                    <div ref="autoplay" class="lunbo">
                        <picture>
                            <source media="(max-width:480px)" srcset="@/assets/des-gb.png">
                            <img :src="gangbi" alt="gangbi" loading="lazy">
                        </picture>
                        <picture>
                            <source media="(max-width:480px)" srcset="@/assets/zjgn.png">
                            <img :src="zjgn" alt="zjgn" loading="lazy">
                        </picture>
                        <picture>
                            <source media="(max-width:480px)" srcset="@/assets/gsjr.png">
                            <img :src="gsjr" alt="gsjr" loading="lazy">
                        </picture>
                        <picture>
                            <source media="(max-width:480px)" srcset="@/assets/des-gb.png">
                            <img :src="gangbi" alt="gangbi" loading="lazy">
                        </picture>
                    </div>
                    <div class="wenan">
                        <div class="title">{{ t("design.title") }}</div>
                        <div class="description">{{ t("design.description_1") }}
                            <span v-if="lang"><br></span>
                            {{ t("design.description_2a") }}
                            <span>{{ t("design.description_2b") }}</span>
                            {{ t("design.description_2c") }}
                            <span v-if="lang"><br></span>
                            {{ t("design.description_3") }}
                        </div>
                        <div class="login" @click.stop="router.push({ name: 'login' })">{{ t("pub.login_2") }}</div>
                    </div>
                </div>
            </div>
            <div class="cooperation-container">
                <div class="cooperation">
                    <div class="image">
                        <picture>
                            <source media="(max-width:480px)" srcset="@/assets/cooperation.png">
                            <img :src="cooperation" alt="cooperation" loading="lazy">
                        </picture>
                    </div>
                    <div class="content">
                        <div class="title">{{ t("cooperation.title") }}</div>
                        <div class="description">
                            {{ t("cooperation.description_1") }}
                            <span v-if="lang"><br></span>
                            {{ t("cooperation.description_2") }}
                            <span v-if="lang"><br></span>
                            {{ t("cooperation.description_3") }}
                        </div>
                        <div class="login" @click.stop="router.push({ name: 'login' })">{{ t("pub.login_2") }}</div>
                    </div>
                </div>
            </div>
            <div class="platform-container">
                <div class="platform">
                    <div class="top">
                        <div class="title">{{ t("platform.title") }}</div>
                        <div class="description">{{ t("platform.description") }}</div>
                    </div>
                    <div class="bottom">
                        <picture>
                            <source media="(max-width:480px)" srcset="@/assets/kuaduan.png">
                            <img :src="kuaduan" alt="kuaduan" loading="lazy">
                        </picture>
                    </div>
                </div>
            </div>
            <div class="end">
                <div class="content">
                    <div class="title">{{ t("end.title") }}</div>
                    <div class="login" @click.stop="router.push({ name: 'login' })">{{ t("pub.login_1") }}</div>
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
import { onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const autoplay = ref<HTMLElement>()
const lang = ref<boolean>(false)

let timer: any
function autoPlay() {
    if (!autoplay.value) return
    let i = 0
    timer = setInterval(() => {
        autoplay.value?.scrollTo({ top: 0, left: autoplay.value.clientWidth * i })
        if (i === (autoplay.value!.children.length - 1)) {
            const timer = setTimeout(() => {
                autoplay.value!.style.scrollBehavior = 'auto'
                autoplay.value?.scrollTo({ top: 0, left: 0 });
                autoplay.value!.style.scrollBehavior = ''
                i = 1
                clearTimeout(timer)
            }, 1000);
        }
        i++
    }, 3000)
}

function checkLang() {
    return window.navigator.language.includes('zh')
}

const font=new FontFace("zihunbiantaoti","@/assets/fonts/zihun.ttf")

console.log(font);


onMounted(() => {
    if (autoplay.value) autoPlay()
    lang.value = checkLang()
})

onUnmounted(() => {
    clearInterval(timer)
})

</script>

<style lang="scss" scoped>
@mixin login {
    cursor: pointer;
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

    &:hover {
        background-color: #429AFF;
    }

    &:active {
        background-color: #0A59CF;
    }
}

@mixin login-link {
    cursor: pointer;
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

    &:hover {
        color: #429AFF;

        &::after {
            border-bottom-color: #429AFF;
        }
    }


    &:active {
        color: #0A59CF;

        &::after {
            border-bottom-color: #0A59CF;
        }
    }

}

@mixin flex($justify, $direction) {
    display: flex;
    align-items: center;
    justify-content: $justify;
    flex-direction: $direction;
}

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
        @include flex(flex-end, column);
        width: 100%;
        height: 100%;
        max-width: 1440px;
        min-width: 1152px;

        .title {
            text-align: center;
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
            @include login
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
    @include flex(center, row);

    .lunbo {
        width: 746px;
        height: 620px;
        display: flex;
        overflow: hidden;
        scroll-behavior: smooth;
        scroll-margin-inline-end: 0;

        &::-webkit-scrollbar {
            display: none;
        }

        picture {
            min-width: 100%;
            height: 100%;

            img {
                width: 100%;
                height: 100%;
            }

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
            @include login-link
        }
    }

}

.cooperation {
    @include flex(center, row-reverse);

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
            @include login-link
        }
    }
}

.platform {
    @include flex(flex-end, column);

    .top {
        @include flex(center, column);

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
        text-align: center;
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

@media (max-width:480px) {
    .main-content {

        .start,
        .end {
            min-width: 100%;
            height: auto;

            .content {
                min-width: 100%;
                padding: 10px;
                box-sizing: border-box;

                .title {
                    margin: 0;
                    font-size: 24px;
                }

                .description {
                    margin: 12px 0;
                    font-size: 14px;
                    line-height: 20px;
                }

                .login {
                    margin: 0;
                    font-size: 14px;
                    width: 140px;
                    min-height: 48px;
                }
            }
        }

        .end .content .login {
            margin: 20px 0;
        }

        .moss-container,
        .design-container,
        .cooperation-container,
        .platform-container {
            min-width: 100%;

            .moss,
            .design,
            .cooperation,
            .platform {
                min-width: 100%;
                height: auto;
                padding: 10px;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
            }

            .platform {
                height: auto;
            }

            .design {
                .lunbo {
                    width: 100%;
                    height: auto;
                }

                .wenan {
                    width: 100%;
                    height: auto;
                    padding: 0;
                    margin: 20px 0;


                    .title {
                        margin: 0;
                        font-size: 20px;
                    }

                    .description {
                        margin: 12px 0;
                        font-size: 14px;
                        line-height: 20px;
                    }

                    .login {
                        margin: 0;
                        font-size: 14px;
                    }
                }

            }

            .cooperation {


                .image {
                    width: 100%;
                    height: auto;
                }

                .content {
                    margin: 20px 0;
                    width: 100%;
                    height: auto;
                    padding: 0;

                    .title {
                        margin: 0;
                        font-size: 20px;
                    }

                    .description {
                        margin: 12px 0;
                        font-size: 14px;
                        line-height: 20px;
                    }

                    .login {
                        margin: 0;
                        font-size: 14px;
                    }
                }
            }

            .platform {
                .top {
                    .title {
                        font-size: 20px;
                    }

                    .description {
                        font-size: 14px;
                        margin: 12px 0;
                        text-align: center
                    }
                }

                .bottom {
                    width: 100%;
                    height: auto;
                    min-width: 100%;
                    min-height: 100%;
                }
            }
        }
    }

}
</style>
