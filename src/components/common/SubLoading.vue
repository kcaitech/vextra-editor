<template>
  <div class="wrap">
    <div class="container" @click.stop @mousedown.stop @mousemove.stop @mouseup.stop>
      <div class="loader"></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.wrap {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 9999;
  // background-color: rgba($color: #ffffff, $alpha: 0.05);

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
      border: 4px solid transparent;
      border-top: 4px solid grey;
      border-left: 4px solid grey;
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
}
</style>
