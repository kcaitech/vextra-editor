<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import avatar from '@/assets/login-img.png';

const { t } = useI18n();

</script>

<template>
  <div class="logo">
    <img src="@/assets/logo-img.png" alt="logo" width="966px" height="614px">
  </div>
</template>

<style lang="scss" scoped>
.logo {
  position: relative;
  left: -5%;
  overflow: hidden;
  box-sizing: border-box;
}

@media (max-width:880px) {
  .logo {
    display: none;
  }
}
</style>