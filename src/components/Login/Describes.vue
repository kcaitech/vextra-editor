<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import avatar from '@/assets/pd-logo-svg.svg';

const { t } = useI18n();

</script>

<template>
  <div class="logo">
    <img :src="avatar" alt="ProtoDesign" />
    <h1>{{ t('system.product_name') }}</h1>
    <p>{{ t('system.product_description') }}</p>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  width: 560px;
  height: 480px;
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  box-sizing: border-box;
  margin-bottom: 160px;
  

  img {
    width: 160px;
    height: 160px;
    margin: 20px;
    animation: moveDown .5s;
  }

  h1 {
   
    font-size: 48PX;
    height: 160px;
    line-height: 160px;
    color: white;
    margin: 20px;
    text-shadow: rgba(17, 17, 26, 0.1) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 48px;;
    animation: moveDown .5s;
  }

  p {
    font-size: 16PX;
    color: white;
    margin-top: 20px;
    text-shadow:rgba(17, 17, 26, 0.1) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 48px;;
    animation: moveup .5s;
  }

}
@media (max-width: 1200px) and (max-height: 800px) {
  /* 在这里添加您想要应用的样式 */
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
}</style >