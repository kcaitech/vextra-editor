<template>
    <div class="content" v-html="htmlContent(Markdowncontent)"></div>
</template>
<script setup lang="ts">
import { htmlContent } from "@/utils/showmarkdown";
import Markdowncontent from "@/assets/serviceagreement.md";
</script>
<style lang="scss" scoped>
.content {
    color: #333333;
    max-width: 880px;
    letter-spacing: 1px;
    overflow: hidden;
    padding: 0 12px;
}

@media (max-width:880px) {
    .content {
        font-size: 14px;
    }
}

</style>
