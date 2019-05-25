#!/bin/bash

#           certonly --webroot --webroot-path=/var/www/html        -d api.nevatrip.ru --agree-tos --email info@api.nevatrip.ru --no-eff-email --staging

echo "-start-------------------------------------------------------------------------------------------------------------------------"

certbot certonly --webroot --webroot-path=/var/www/letsencrypt -d "$CN"           --agree-tos --email "$EMAIL"             --no-eff-email --staging

echo "-end---------------------------------------------------------------------------------------------------------------------------"

cp /etc/letsencrypt/archive/"$CN"/cert1.pem /var/certs/cert1.pem
cp /etc/letsencrypt/archive/"$CN"/privkey1.pem /var/certs/privkey1.pem
