#!/bin/bash

wget --no-verbose -O /exchanges/cbr_$(date +%Y-%m-%d_%H-%M-%S).json https://www.cbr-xml-daily.ru/daily_json.js
