docker pull jenkins/jenkins:lts-jdk11

docker network create kcdesign 

# https://github.com/jenkinsci/docker/blob/master/README.md

sudo docker run -d -v jenkins_home:/var/jenkins_home -v kcdesign_client:/var/kcdesign_client -v kcdesign_electron:/var/kcdesign_electron -v kcdesign_server:/var/kcdesign_server --restart=on-failure --network kcdesign --name jenkins -e JENKINS_OPTS="--prefix=/jenkins" -e TZ=Asia/Shanghai  -u root --env JAVA_OPTS="-Xmx2048m -Djava.awt.headless=true" jenkins/jenkins:lts-jdk11

# jenkins拉取代码需要在codeup添加签名
# 签名生成
# ssh-keygen -t rsa -C "jenkins"

# openresty
docker pull openresty/openresty:1.21.4.1-0-alpine

# nginx配置文件放在~/kcdesign/nginx
docker run -d -v kcdesign_client:/usr/share/nginx/html  -v ~/kcdesign/nginx:/etc/nginx/conf.d  -p 80:80 --network kcdesign --restart=on-failure --name openresty openresty/openresty:1.21.4.1-0-alpine

