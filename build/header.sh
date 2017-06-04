#!/usr/bin/env bash
set -e

cat <<END
//  Roll Parser v$(node -p 'require("./package.json").version')
//  https://github.com/edloidas/roll-parser
//  MIT (c) 2017-$(git show -s --format=%ai | cut -d - -f 1) Mikita Taukachou
END
