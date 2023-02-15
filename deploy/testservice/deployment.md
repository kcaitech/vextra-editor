docker pull jenkins/jenkins:lts-jdk11

docker network create sktest 

# https://github.com/jenkinsci/docker/blob/master/README.md

sudo docker run -d -v jenkins_home:/var/jenkins_home -v sktest_client:/var/sktest_client -v sktest_electron:/var/sktest_electron -v sktest_server:/var/sktest_server --restart=on-failure --network sktest --name jenkins -e JENKINS_OPTS="--prefix=/jenkins" -e TZ=Asia/Shanghai  -u root --env JAVA_OPTS="-Xmx2048m -Djava.awt.headless=true" jenkins/jenkins:lts-jdk11

# jenkins拉取代码需要在codeup添加签名
# 签名生成
# ssh-keygen -t rsa -C "jenkins"

# openresty
docker pull openresty/openresty:1.21.4.1-0-alpine

# nginx配置文件放在~/sktest/nginx
docker run -d -v sktest_client:/usr/share/nginx/html  -v ~/sktest/nginx:/etc/nginx/conf.d  -p 80:80 --network sktest --restart=on-failure --name openresty openresty/openresty:1.21.4.1-0-alpine

