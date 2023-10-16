import axios from 'axios'
import { API_URL } from '@/utils/setting';
import { router } from '@/router'
import { ElMessage } from 'element-plus'

// 处理  类型“AxiosResponse<any, any>”上不存在属性“errorinfo”。
declare module "axios" {
    interface AxiosResponse<T = any> {
        errorinfo: null
        code: number
        message:string
    }
    export function create(config?: AxiosRequestConfig): AxiosInstance;
}

const service = axios.create({
    baseURL: API_URL,
    timeout: 60000,
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

let loginModal = false; //重复弹出要屏蔽
// 添加响应拦截器
service.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    // dataAxios 是 axios 返回数据中的 data
    const dataAxios = response.data || {}

    // 这个状态码是和后端约定的
    const code = dataAxios.reset

    if (dataAxios.code === 0) {
        return Promise.resolve(dataAxios)
    } else if (dataAxios && dataAxios.code && dataAxios.code === 400) {
        return Promise.resolve(dataAxios)
    }else if (dataAxios && dataAxios.code && dataAxios.code === -1) {
        return Promise.resolve(dataAxios)
    } else {
        if (dataAxios && dataAxios.code && dataAxios.code === 401) {
            const timer = setTimeout(() => {
                loginModal = false;
                clearTimeout(timer)
            }, 5000);
            if (!loginModal) {
                ElMessage({
                    message: '登录失效，请重新登录',
                    type: 'error',
                    icon: 'none'
                })
            }
            loginModal = true
            router.push('/login')
            localStorage.removeItem('token')
        }
        return Promise.reject(response)
    }

}, function (error) {

    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});


export default service