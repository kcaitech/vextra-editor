<script lang="ts" setup>

</script>

<template>
  <div class="box">
    <div class="balls">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.box {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 999;

  .balls {
    position: relative;

    span {
      position: absolute;
      width: 20px;
      height: 20px;
      background: #3498db;
      opacity: 0.5;
      border-radius: 100%;
      animation: anim 1s infinite ease-in-out;
    }

    &> :nth-child(2) {
      left: 20px;
      animation-delay: 0.2s;
    }

    &> :nth-child(3) {
      left: 40px;
      animation-delay: 0.4s;
    }

    &> :nth-child(4) {
      left: 60px;
      animation-delay: 0.6s;
    }

    &>:nth-child(5) {
      left: 80px;
      animation-delay: 0.8s;
    }
  }
}

@keyframes anim {
  0% {
    opacity: 0.3;
    transform: translateY(0px);
  }

  50% {
    opacity: 1;
    transform: translateY(-10px);
    background: #f9cdff;
  }

  100% {
    opacity: 0.3;
    transform: translateY(0px);
  }
}
</style>