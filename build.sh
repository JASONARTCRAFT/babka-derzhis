#!/bin/sh
# Собирает src/* в один index.html (артефакт должен быть одним файлом).
cd "$(dirname "$0")"
{
  cat src/page.html
  echo '<script>'
  cat src/core.js src/music.js src/audio.js src/data.js src/draw.js src/game.js src/farm.js src/screens.js
  echo '</script>'
} > index.html
echo "index.html: $(wc -c < index.html) bytes"
