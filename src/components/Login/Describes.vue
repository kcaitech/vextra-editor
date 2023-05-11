<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

</script>

<template>
    <div class="logo">
        <img src="http://www.uimaker.com/uploads/allimg/200105/112501I08_0.png" alt="ProtoDesign" />
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

    img {
        width: 160px;
        height: 160px;
        margin: 20px;
    }

    h1 {
        font-size: 60PX;
        color: white;
        margin: 20px;
    }

    p {
        font-size: 20PX;
        color: white;
        margin-top: 20px;
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
</style >