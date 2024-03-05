<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import gongan from '@/assets/gongan.png';
const { t } = useI18n();

</script>

<template>
    <div class="footer">
        <span>
            {{ t('system.login_footer') }}
        </span>
        <span>
            <RouterLink to="/serviceagreement">{{ t('system.read_TOS') }}</RouterLink>
        </span>
        <span>
            <RouterLink to="/privacypolicy">{{ t('system.read_Privacy') }}</RouterLink>
        </span>
        <br>
        <a class="icp" href="https://beian.miit.gov.cn/" target="_blank">
            <span>{{ t('system.license_key') }}</span>
        </a>
        <a class="gongan" href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44049102496973"
            target="_blank">
            <img :src="gongan" alt="gongan">
            <span>粤公网安备 44049102496973号</span>
        </a>

    </div>
</template>

<style lang="scss" scoped>
.footer {
    display: flex;
    position: fixed;
    align-items: center;
    flex-wrap: wrap;
    z-index: 1;
    bottom: 0;
    color: rgb(96, 96, 96);
    font-size: 12px;

    span {
        margin: 5px;
    }

    a {
        text-decoration: none;
        color: rgb(96, 96, 96);
    }

    img {
        width: 12px;
    }

    .gongan {
        display: flex;
        align-items: center;

        span {
            margin-left: 2px;
        }
    }

}
</style>