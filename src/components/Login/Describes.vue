<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import avatar from '@/assets/pd-logo-svg.svg';

const { t } = useI18n();

</script>

<template>
    <div class="logo">
        <img :src="avatar" alt="ProtoDesign" />
        <h1>{{t('system.product_name')}}</h1>
        <p>{{t('system.product_description')}}</p>
    </div>
</template>

<style lang="scss" scoped>
.logo {
    width: 600px;
    height: 500px;
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    box-sizing: border-box;

    img {
        width: 160px;
        height: 160px;
        margin: 20px;
        animation: moveDown 1.5s ;
    }

    h1 {
        font-size: 60PX;
        height: 160px;
        line-height: 160px;
        color: white;
        margin: 20px;
        animation: moveDown 1.5s ;
    }

    p {
        font-size: 20PX;
        color: white;
        margin-top: 20px;
        animation: moveup 1.5s ;
    }

}

@media screen and (max-height: 600px) {
    .logo {
        display: none;
    }

}
@media screen and (max-width: 800px) {
    .logo {
        display: none;
    }

}

@keyframes moveDown {
  0% {
    opacity: 0;
    transform: translateY(-300px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes moveup {
  0% {
    opacity: 0;
    transform: translateY(300px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style >