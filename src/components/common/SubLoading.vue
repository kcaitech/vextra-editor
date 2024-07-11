<template>
<div class="wrap">
    <div class="container" @click.stop @mousedown.stop @mousemove.stop @mouseup.stop>
        <div class="loader"></div>
    </div>
</div>
</template>
<style scoped lang="scss">
.wrap {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: rgba($color: #ffffff, $alpha: 0.3);
    top: 0;

    .container {
        width: 20px;
        height: 20px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        > .loader {
            width: 100%;
            height: 100%;
            border: 2px solid transparent;
            border-top: 2px solid var(--active-color);
            border-left: 2px solid var(--active-color);;
            border-radius: 50%;
            box-sizing: border-box;

            & {
                animation: spin 1s linear infinite;
            }
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
