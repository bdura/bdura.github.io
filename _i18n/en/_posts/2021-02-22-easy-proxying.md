---
date: 2021-02-22
title: Easy proxying from a Raspberry Pi
categories:
  - rpi
  - web
image:
  source: https://source.unsplash.com/0tfz7ZoXaWc
  legend:
  reference:
---

I am not a web developer. Nor am I a systems architect. That is partly why I am sharing this tip today : I am afraid I might forget my set up if I do not.

```yaml
version: '2'


services:
  nginx-proxy:
    image: mattjeanes/jwilder-nginx-proxy-arm64
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - conf:/etc/nginx/conf.d
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - dhparam:/etc/nginx/dhparam
      - certs:/etc/nginx/certs:ro
      - /var/run/docker.sock:/tmp/docker.sock:ro
    restart: always

  letsencrypt:
    image: jrcs/letsencrypt-nginx-proxy-companion
    container_name: nginx-proxy-le
    depends_on:
      - nginx-proxy
    volumes_from:
      - nginx-proxy
    volumes:
      - certs:/etc/nginx/certs
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: always


volumes:
  conf:
  vhost:
  html:
  dhparam:
  certs:


networks:
  default:
    external:
      name: nginx-proxyß
```
