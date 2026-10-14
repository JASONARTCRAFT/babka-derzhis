#!/bin/sh
# Собирает src/* в index.html; картинки грузятся из assets/comic/ по manifest.json.
cd "$(dirname "$0")"
{
  cat src/page.html
  echo '<script>'
  printf 'const COMIC_DATA='; cat assets/comic/manifest.json; echo ';'
  cat src/assets.js src/core.js src/music.js src/audio.js src/data.js src/draw.js src/street.js src/events.js src/thief.js src/game.js src/farm.js src/blueprints.js src/survival.js src/menu.js src/screens.js
  echo '</script>'
} > index.html
echo "index.html: $(wc -c < index.html) bytes"
