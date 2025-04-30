# About This Directory

This directory is intended to store the SSL/TLS certificate and private key files used by the NGINX web server.

## Files to Place Here

- `roleinitiative-cert.pem` — The SSL/TLS certificate (or full chain including intermediates)
- `roleinitiative-key.pem` — The private key corresponding to the certificate

## Purpose

These files are used by NGINX to serve HTTPS traffic. They are referenced in the NGINX configuration like this:

```nginx
    ...
    ssl_certificate     /etc/nginx/certs/roleinitiative-cert.pem;
    ssl_certificate_key /etc/nginx/certs/roleinitiative-key.pem;
    ...
```