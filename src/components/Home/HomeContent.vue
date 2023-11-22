<template>
    <div class="main-content">
        <div v-for="index in 5" :key="index" :class="'container'" :id="'container' + index">
            <div class="box-content" :id="'box-content' + index"></div>
        </div>
    </div>
    <div class="meun">
        <ul class="meunlist">
            <li v-for=" index in 5" :key="index" :class="{ select: selectid === ('#container' + index) }"
                @click="scrollToSection('#container' + index)"></li>
        </ul>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';

const selectid = ref('')
const Elements = ref<any>()

let timer: any
const scrollToSection = (selector: string) => {
    const targetElement = document.querySelector(selector)
    if (targetElement) {
        observer.disconnect() //停止观察，避免手动点击小圆点和观察回调命中小圆点的方法冲突，导致小圆点选中状态异常
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        selectid.value = selector
    }
    timer = setTimeout(() => {
        startObserving(Elements.value) //延迟0.5秒后重启观察
        clearTimeout(timer)
    }, 500);
}


let thresholdSets = [];

for (let i = 0; i <= 1.0; i += 0.01) {
    thresholdSets.push(i);
}

const RatioNumber = (num: number) => {
    switch (true) {
        case num >= 0.95:
            return 1;
        case num >= 0.85:
            return 0.9;
        case num >= 0.75:
            return 0.8;
        case num >= 0.65:
            return 0.7;
        case num >= 0.55:
            return 0.6;
        case num >= 0.45:
            return 0.5;
        case num >= 0.35:
            return 0.4;
        case num >= 0.25:
            return 0.3;
        case num >= 0.15:
            return 0.2;
        case num >= 0.05:
            return 0.1;
        default:
            return 0;
    }
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const el1 = document.querySelector('#box-content1')! as HTMLElement
        const el2 = document.querySelector('#box-content2')! as HTMLElement
        const el3 = document.querySelector('#box-content3')! as HTMLElement
        const el4 = document.querySelector('#box-content4')! as HTMLElement
        const el5 = document.querySelector('#box-content5')! as HTMLElement
        if (entry.target.id === 'container1') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el1.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`
            }
        }
        if (entry.target.id === 'container2') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el2.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`

            }
        }
        if (entry.target.id === 'container3') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el3.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`

            }
        }
        if (entry.target.id === 'container4') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el4.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`

            }
        }
        if (entry.target.id === 'container5') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el5.style.transform = `translateY(-50%) scale(${RatioNumber(Number(entry.intersectionRatio.toFixed(2))) + 1})`
            }
        }
        if (entry.intersectionRatio >= 0.5) {
            selectid.value = '#' + entry.target.id
        }
    });

}, { root: null, threshold: thresholdSets });

const startObserving = (elements: any) => {
    elements.forEach((el: any) => {
        if (el as HTMLElement) {
            observer.observe(el);
        }
    })
}

onMounted(() => {
    const containerElements = document.querySelectorAll('.container')
    startObserving(containerElements)
    Elements.value = containerElements
})
</script>
<style lang="scss" scoped>
.select {
    background-color: blue;
    border: 1px solid blue !important;
}



.main-content {
    background-color: #99999976;
    overflow: hidden;
    width: 100%;

    .container {
        min-height: calc(100vh - 56px);
        display: flex;

        button {
            height: 40px;
            width: 80px;
            border: 1px solid black;
            border-radius: 4px;
            background-color: transparent;
            cursor: pointer;

            &:hover {
                border: 1px solid #9775fa;
                color: #9775fa;
            }
        }

        &:nth-child(1) {
            // background-color: olive;
            align-items: center;
            position: relative;
        }

        &:nth-child(2) {
            // background-color: sandybrown;
            justify-content: center;
            position: relative;
        }

        &:nth-child(3) {
            // background-color: seagreen;
            align-items: center;
            justify-content: space-around;
            position: relative;
        }

        &:nth-child(4) {
            // background-color: aqua;
            align-items: center;
            justify-content: space-evenly;
            flex-direction: column;
            position: relative;
        }

        &:nth-child(5) {
            // background-color: blue;
            justify-content: center;
            align-items: flex-end;
            position: relative;
        }
    }
}


.box-content {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 10%;
    width: 20%;
    height: 20%;
    background-color: #e0e0e07c;
    transition: transform 0.5s ease-in-out;
}


.meun {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    right: 20px;

    .meunlist {
        margin: 0;
        padding: 0;
    }

    .meunlist li {
        list-style: none;
        width: 12px;
        height: 12px;
        margin-top: 8px;
        border-radius: 50%;
        border: 1px solid rgb(86, 44, 255);
        cursor: pointer;
        box-sizing: border-box;

        &:hover {
            border: 2px solid rgb(86, 44, 255);
        }
    }
}
</style>
