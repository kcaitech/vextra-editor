<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import avatar from '@/assets/pd-logo-svg.svg';

const { t } = useI18n();

</script>

<template>
  <div class="logo">
    <img src="@/assets/logo.svg" alt="logo">
  </div>
</template>

<style lang="scss" scoped>
.logo {
  position: relative;
  top: -60px;
  width: 793px;
  height: 197px;

  img {
    width: 100%;
    height: 100%;
  }
}

@media (max-width:880px) {
  .logo {
    display: none;
  }
}
</style>