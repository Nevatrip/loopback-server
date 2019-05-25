FROM phusion/baseimage:0.9.19

COPY scripts /root/scripts/

RUN apt-get update
RUN apt-get install software-properties-common -y
RUN add-apt-repository universe
RUN add-apt-repository ppa:certbot/certbot
RUN apt-get update
RUN apt-get install certbot -y

ENTRYPOINT bash -c "bash /root/scripts/run-certbot.sh && sleep infinity"
