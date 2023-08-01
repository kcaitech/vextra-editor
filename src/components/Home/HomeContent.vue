<template>
        <div class="main-content">
            <div class="container" id="container1">
                <div class="box-content" id="box-content1"></div>
               
            </div>
            <div class="container" id="container2">
                <div class="box-content" id="box-content2"></div>
                
            </div>
            <div class="container" id="container3">
                <div class="box-content" id="box-content3"></div>
                
            </div>
            <div class="container" id="container4">
                <div class="box-content" id="box-content4"></div>
                    
            </div>
            <div class="container" id="container5">
                <div class="box-content" id="box-content5"></div>
                             
            </div>
        </div>
        <div class="meun">
            <ul class="meunlist">
                <li :class="{ select: selectid === '#container1' }" @click="scrollToSection('#container1')"></li>
                <li :class="{ select: selectid === '#container2' }" @click="scrollToSection('#container2')"></li>
                <li :class="{ select: selectid === '#container3' }" @click="scrollToSection('#container3')"></li>
                <li :class="{ select: selectid === '#container4' }" @click="scrollToSection('#container4')"></li>
                <li :class="{ select: selectid === '#container5' }" @click="scrollToSection('#container5')"></li>
            </ul>
        </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
const selectid = ref('')
const scrollToSection = (selector: string) => {
    const targetElement = document.querySelector(selector)
    if (targetElement) {
        disconnectObserver()
        targetElement.scrollIntoView({ behavior: 'smooth', block:'center' });
        selectid.value = selector
    }
    setTimeout(() => {
        startObserving();
    }, 500);
}

const disconnectObserver = () => {
    observer.disconnect();
}

let thresholdSets = [];

for (let i = 0; i <= 1.0; i += 0.01) {
    thresholdSets.push(i);
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
                el1.style.transform = `translateY(-50%) scale(${Number(entry.intersectionRatio.toFixed(2)) + 0.2})`
            }
        }
        if (entry.target.id === 'container2') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el2.style.transform = `translateY(-50%) scale(${Number(entry.intersectionRatio.toFixed(2)) + 0.2})`

            }
        }
        if (entry.target.id === 'container3') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el3.style.transform = `translateY(-50%) scale(${Number(entry.intersectionRatio.toFixed(2)) + 0.2})`

            }
        }
        if (entry.target.id === 'container4') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el4.style.transform = `translateY(-50%) scale(${Number(entry.intersectionRatio.toFixed(2)) + 0.2})`

            }
        }
        if (entry.target.id === 'container5') {
            if (entry.isIntersecting) {
                if (entry.intersectionRatio === 0) return
                el5.style.transform = `translateY(-50%) scale(${Number(entry.intersectionRatio.toFixed(2)) + (0.2)})`
            }
        }
        if (entry.intersectionRatio >= 0.5) {
            selectid.value = '#' + entry.target.id
        }
    });

}, { root: null, threshold: thresholdSets });

const startObserving = () => {
    document.querySelectorAll('.container').forEach((el) => {
        if (el) {
            observer.observe(el);
        }
    })
}

onMounted(() => {
    setTimeout(() => {
        startObserving()
    }, 1000);
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
            min-height: 100vh;
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
        transition: transform 0.3s ease-in-out;
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
