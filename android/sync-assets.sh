#!/bin/sh
# Копирует веб-версию из ../docs в assets Android-проекта
cd "$(dirname "$0")" && mkdir -p app/src/main/assets && cp -r ../docs/* app/src/main/assets/
