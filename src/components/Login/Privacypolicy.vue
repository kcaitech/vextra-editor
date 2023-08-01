<template>
    <div class="content" v-html="htmlContent(Markdowncontent)"></div>
</template>
<script setup lang="ts">
import { htmlContent } from "@/utils/showmarkdown";
import Markdowncontent from "@/assets/privacypolicy.md"
</script>

<style lang="scss">
.content {
    color: #333333;
    max-width: 880px;
    letter-spacing: 1px;
    overflow: hidden;
    padding: 0 12px;

    h1 {
        text-align: center;
    }

    .update,
    .date {
        font-weight: 500;
        text-align: right;
    }

    p,
    li {
        line-height: 32px;
    }

}

@media (max-width:880px) {
    h1 {
        font-size: 24px;
    }

    h2 {
        font-size: 18px;
    }

    .update,
    .date {
        margin: 0;
        margin-bottom: 8px;
    }

    p,
    li {
        font-size: 14px;
        line-height: 28px !important;
    }

}
</style>
