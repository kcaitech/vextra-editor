<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import gongan from '@/assets/gongan.png';
import { locale } from '@/locale';
const { t } = useI18n();
const iszh = locale === 'zh';

</script>

<template>
    <div class="footer">
        <span>
            {{ t('system.login_footer') }}
        </span>
        <span class="lines">|</span>
        <span>
            <RouterLink to="/serviceagreement">{{ t('system.read_TOS') }}</RouterLink>
        </span>
        <span class="lines">|</span>
        <span>
            <RouterLink to="/privacypolicy">{{ t('system.read_Privacy') }}</RouterLink>
        </span>
        <div class="zhfooter" v-if="iszh">
            <span class="lines">|</span>
            <a class="icp" href="https://beian.miit.gov.cn/" target="_blank">
                <span>{{ t('system.license_key') }}</span>
            </a>
            <span class="lines">|</span>
            <a class="gongan" href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44049102496973"
                target="_blank">
                <img :src="gongan" alt="gongan" width="12px" height="12px">
                <span>粤公网安备44049102496973号</span>
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.lines {
    margin: 6px;
}

.footer {
    display: flex;
    position: fixed;
    align-items: center;
    flex-wrap: wrap;
    z-index: 1;
    bottom: 0;
    color: #a8a8a8;
    font-size: 12px;

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
</style>