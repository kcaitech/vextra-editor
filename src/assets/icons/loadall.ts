// import Vue from "vue";
// import SvgIcon from "../components/SvgIcon/Index"; //svg组件
//全局注册组件
// Vue.component("svg-icon", SvgIcon);
// 定义一个加载目录的函数
const requireAll = (r: any) => r.keys().map(r);
// 加载目录下的所有的 svg 文件
requireAll(require.context("./svg", false, /\.svg$/));
