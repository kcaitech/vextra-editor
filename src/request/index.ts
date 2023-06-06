import axios from 'axios'
import { BASE_URL } from '@/utils/setting';


// 处理  类型“AxiosResponse<any, any>”上不存在属性“errorinfo”。
declare module "axios" {
    interface AxiosResponse<T = any> {
        errorinfo: null
        code: number
    }
    export function create(config?: AxiosRequestConfig): AxiosInstance;
}

// 创建一个 axios 实例
const service = axios.create({
    baseURL: 'http://192.168.0.10:10000/api/v1',
    // baseURL: BASE_URL,
    //  baseURL: 'https://mock.apifox.cn/m1/2612240-0-1d5a81b5', // 所有的请求地址前缀部分
    timeout: 60000, // 请求超时时间毫秒
})



// 添加请求拦截器
service.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2ODQ4MjE2MzAsIm5iZiI6MTY4NDIxNjgzMCwiaWF0IjoxNjg0MjE2ODMwLCJkYXRhIjp7ImRhdGEiOnsiaWQiOiI4Iiwibmlja25hbWUiOiJJY2UuWiJ9fX0.A3yAAChDLYRTvfSgNwcAzIVdBBvkat8NMJQD0JOySYs'
    if (token) {
        // config.headers['TOKEN'] = token;
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


// 添加响应拦截器
service.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    // dataAxios 是 axios 返回数据中的 data
    const dataAxios = response.data
    // 这个状态码是和后端约定的
    const code = dataAxios.reset
    return dataAxios
}, function (error) {

    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});


export default service