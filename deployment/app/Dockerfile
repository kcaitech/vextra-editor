FROM nginx:1.25

COPY deployment/app/nginx.conf /etc/nginx/nginx.conf
COPY deployment/app/conf.d/ /etc/nginx/conf.d/
COPY dist/ /usr/share/nginx/html/
