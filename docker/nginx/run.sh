#!/bin/sh
mkdir /etc/nginx/certs
cd /etc/nginx/certs
mkdir -p root
# create CA SSL key
openssl genrsa -out root/ca.key 4096
# create CA SSL cert
openssl req -new -x509 -days 365 -sha256 -subj "/C=TW/ST=NewTaipei/O=JazzHipster/OU=TOMATOX/CN=localhost" -key root/ca.key -out root/ca.crt

mkdir -p server
# create Server SSL key
openssl genrsa -out server/server.key 2048
# create Server SSL csr
openssl req -new -key server/server.key -subj "/C=TW/ST=NewTaipei/O=JazzHipster/OU=TOMATOX/CN=vue3-mediapipe-app.com.tw" -out server/server.csr
# create Server SSL cert
openssl x509 -req -CAcreateserial -days 30 -sha256 -CA root/ca.crt -CAkey root/ca.key -in server/server.csr -out server/server.crt

/usr/sbin/nginx-debug -g "daemon off;"