<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import gongan from '@/assets/gongan.png';
import footer from '@/assets/footer-logo.svg';
import { locale } from '@/locale';
import { router } from '@/router'
const { t } = useI18n();
const iszh = locale === 'zh';
const data = [
    { title: "产品", content: ['产品介绍'] },
    { title: "公司", content: ['服务条款', '隐私协议'] },
    { title: "联系", content: ['邮箱'] }
]

const skipTotarget = (i: string) => {
    switch (i) {
        case "产品介绍":
            window.open("https://kdocs.cn/l/cm596JlSFAHF", "_blank")
            break;
        case "关于我们":
            router.push({ path: '/' })
            break;
        case "服务条款":
            router.push({ path: 'serviceagreement' })
            break;
        case "隐私协议":
            router.push({ path: 'privacypolicy' })
            break;
        default:
            break;
    }
}

</script>

<template>
    <div class="footer">
        <div class="header">
            <div class="left">
                <div class="logo">
                    <img :src="footer" alt="log">
                </div>
            </div>
            <div class="right">
                <div class="list" v-for="(item, index) in data" :key="index">
                    <div class="title">{{ item.title }}</div>
                    <div class="content" v-for="(i, index) in item.content" :key="index" @click.stop="skipTotarget(i)">
                        {{ i === '邮箱' ? `${i}: ` : i }}<a v-if="i === '邮箱'"
                            href="mailto:contact@kcaitech.com">contact@kcaitech.com</a></div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <span>{{ t('system.login_footer') }}</span>
            <span class="lines">|</span>
            <RouterLink to="/serviceagreement">{{ t('system.read_TOS') }}</RouterLink>
            <span class="lines">|</span>
            <RouterLink to="/privacypolicy">{{ t('system.read_Privacy') }}</RouterLink>
            <div class="zhfooter" v-if="iszh">
                <span class="lines">|</span>
                <a class="icp" href="https://beian.miit.gov.cn/" target="_blank">
                    <span>{{ t('system.license_key') }}</span>
                </a>
                <span class="lines">|</span>
                <a class="gongan" href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44049102496973"
                    target="_blank">
                    <img :src="gongan" alt="gongan">
                    <span>粤公网安备44049102496973号</span>
                </a>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.lines {
    margin: 0 6px;
}


.header {
    display: flex;
    max-width: 1440px;
    min-width: 1152px;
    margin: 56px auto;
    align-items: flex-start;
    flex-wrap: wrap;

    .left {
        flex: 1;

        .logo {
            transform: translateY(-10px)
        }
    }

    .right {
        flex: 3;
        display: flex;
        justify-content: space-between;


        .list {
            display: flex;
            flex-direction: column;
            min-width: 120px;

            .title {
                color: #3D3D3D;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 24px;
            }

            .content {
                cursor: pointer;
                color: #8C8C8C;
                font-size: 14px;
                margin-bottom: 16px;
                // position: relative;

                &:hover {
                    color: #1878F5;
                }

                a {
                    position: relative;

                    &::before {
                        content: "";
                        position: absolute;
                        width: 50px;
                        height: 20px;
                        left: -40px;
                    }
                }
            }

        }
    }
}

.footer {
    width: 100%;
    min-width: 1152px;
    background-color: #ffffff;



    .bottom {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        min-height: 64px;
        color: #8C8C8C;
        font-size: 12px;
        border-top: 1px solid #f5f5f5;

        a {
            text-decoration: none;
            color: #a8a8a8;
        }

        img {
            width: 12px;
            margin-right: 1px;
        }

        .gongan {
            display: flex;
            align-items: center;
        }

        .zhfooter {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
    }

}

@media (max-width:1440px) {
    .header {
        margin: 0;
        padding: 56px 40px;
        box-sizing: border-box;
    }
}

@media (max-width:480px) {
    .header {
        max-width: 100%;
        min-width: 100%;
        padding: 30px 12px 0 12px;
        margin: 0;
        flex-direction: column;
        box-sizing: border-box;

        .right {
            width: 100%;
            flex-wrap: wrap;

            .list {
                flex-basis: 50%;
            }
        }
    }

    .footer {
        min-width: 100%;
    }
}
</style>