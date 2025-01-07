<script lang="ts" setup>
const link = (window as any).__moss_doc_link || 'https://moss.design';

function home() {
    window.open('https://moss.design/', '_blank');
}
</script>
<template>
<div id="#app" style="width: 100%; height: 100vh;">
    <div
        style="margin: 20px auto 0;width: 960px; height: fit-content;background-color: #dcf0f5; padding: 16px;border-radius: 16px;">
        <h3 style="color: #3D3D3D">
            file协议下无法支持脚本运行，如需要预览请前往墨师设计使用播放功能或者在本地搭建一个静态文件服务器进行预览</h3>
        <ul>
            <li>
                <p><a :href="link" target="_blank">前往墨师设计进行预览</a></p>
            </li>
            <li>
                <p>如果想搭建一个临时的静态文件服务器，或许下面的方法可以帮助到您</p>
                <p>1. 安装Node.js环境</p>
                <p style="text-indent: 28px">
                    <a href="https://nodejs.org/en" target="_blank">下载Node.js</a>，并按照指引进行安装
                </p>
                <p style="text-indent: 28px">安装后可以开启终端并执行以下指令查看Node.js环境是否安装成功</p>
                <div class="code" style="margin-left: 28px">
                    <p>> node -v</p>
                </div>
                <p style="text-indent: 28px">如果出现对应的版本信息则说明Node.js环境已经安装成功，可以进行下一步</p>
                <p>2. 安装serve工具</p>
                <p style="text-indent: 28px">serve 工具可以帮助您为单页应用程序、静态站点或是静态文件提供服务</p>
                <div class="code" style="margin-left: 28px">
                    <p>> npm install --global serve</p>
                </div>
                <p style="text-indent: 28px">安装后，在终端切到index.html所在的目录(即JS包目录)下执行以下指令</p>
                <div class="code" style="margin-left: 28px">
                    <p>> serve</p>
                </div>
                <p style="text-indent: 28px">
                    执行指令后出现类似输出则静态文件服务器启动成功，您可以在浏览器中访问serve在终端给出的URL进行站点预览</p>
                <div class="code" style="margin-left: 28px">
                    <p>> serve</p>
                    <div style="border: 2px solid green; padding: 16px;margin-bottom: 24px; width: 400px">
                        <p style="color:green;">Serving!</p>
                        <p><strong>- Local</strong> http://localhost:3000</p>
                        <p><strong>- Network</strong> http://---------:3000</p>
                        <p style="color:grey;">Copied local address to clipboard!</p>
                    </div>
                </div>
            </li>
            <li>
                <p>更多问题可以加入墨师设计交流群咨询我们</p>
            </li>
        </ul>
        <p style="text-align: center; font-style: italic;color: grey;cursor: pointer;" @click="home">@墨师设计</p>
    </div>
</div>

</template>
<style scoped lang="scss">
.mark {
    font-style: italic;
    color: grey;
}

.code {
    width: 800px;
    height: fit-content;
    padding: 16px;
    background-color: #252525;
    border-radius: 8px;
    color: #eaeaea;
}
</style>