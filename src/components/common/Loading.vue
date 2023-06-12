<script lang="ts" setup>

</script>

<template>
  <div class="container">
    <div class="loader"></div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 60px;
  height: 60px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  >.loader {
    width: 100%;
    height: 100%;
    border: 6px solid transparent;
    border-top: 6px solid grey;
    border-left: 6px solid grey;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-sizing: border-box;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
}
</style>