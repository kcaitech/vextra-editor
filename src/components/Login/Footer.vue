<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


</script>

<template>
    <div class="footer">
        <span>
            {{ t('system.login_footer') }}
        </span>
        <span>
            <a href="">{{ t('system.read_TOS') }}</a>
        </span>
        <span>
            <a href="">{{ t('system.read_Privacy') }}</a>
        </span>

    </div>
</template>

<style lang="scss" scoped>
.footer {
    display: flex;
    position: fixed;
    z-index: 1;
    bottom: 0;
    color: rgb(164, 162, 162);
    font-size: 12px;

    >span {
        margin: 5px;

        >a {
            color: rgb(164, 162, 162);
        }
    }


}
</style>