<script setup lang="ts">
import { Context } from "@/context";
import { FillContextMgr } from "@/components/Document/Attribute/Fill2/ctx";

type Props = {
    context: Context;
    manager: FillContextMgr;
}
const props = defineProps<Props>();

</script>
<template>
    <div class="fill-mask-container">

    </div>
</template>
<style scoped lang="scss"></style>