前端发布流程（windows系统）

1、先提条件

（1）在C:\Windows\System32\drivers\etc\hosts文件中添加：
121.199.25.192 registry.protodesign.cn
127.0.0.1 k8s-test.protodesign.cn

修改hosts文件前需先在文件属性-安全中将Users用户的权限修改为完全控制

（2）安装wsl2

（3）安装docker desktop

（4）docker desktop中添加以下配置
{
    "insecure-registries": [
        "registry.protodesign.cn:36000"
    ]
}

2、在cmd命令行进入ssh-port-forward-internal目录，执行start.bat脚本
第一次执行需要输入密码：
kcserver

3、打开页面：http://k8s-test.protodesign.cn:30001/kubernetes/kcserver/namespace/kc/workload/view/Deployment/webapp
右下方查看app容器当前镜像的版本号，例如：`test-0.0.1-23`
账号密码：
admin
kcai1212

4、在cmd命令行进入kcdesign工程的deployment\app目录，执行build.bat脚本

build.bat version-tag
例如：build.bat test-0.0.1-24，注意版本号不能与历史版本号混淆

执行build.bat前注意修改utils\setting.ts中的production，为true时编译正式环境镜像，为false时编译测试环境镜像

执行完毕后注意仔细查看打包时输出的信息，确认：
（1）npm编译通过
（2）docker镜像编译成功
（3）docker镜像上传成功

在以下页面中可确认镜像是否上传成功：
http://registry.protodesign.cn:36000/harbor/projects/2/repositories/webapp/artifacts-tab
账号密码：
kcserver
MEu2o91KHihnuLID6buRGrjRVo9YuM48

5、在页面上方点击“调整镜像版本”按钮，输入新的版本号，例如：`test-0.0.1-24`，点击“确定”
等待页面刷新，查看左侧“历史版本”栏目，确认新版本已发布，并等待新版本的容器状态变为“Ready”（变成绿色即可）
