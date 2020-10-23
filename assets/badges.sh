#!/bin/bash
badge "color" "green" green > color_green.svg
badge "color" "red" red > color_red.svg
badge "color" "blue" blue > color_blue.svg
badge "color" "orange" orange > color_orange.svg
badge "color" "yellow" yellow > color_yellow.svg
badge "downloads" "9876543210" blue > downloads_total.svg
badge "downloads" "12m/week" green > downloads_week.svg
badge "coverage" "101%" darkgreen > coverage_good.svg
badge "coverage" "-1%" darkred > coverage_bad.svg
badge "version" "1.2.3" blue > version.svg
badge "patreon" "0.50 USD/month" tomato > patreon.svg
badge "rating" "★★★☆☆" orange > rating.svg
badge "chat" "1 online" orange > chat.svg
badge "build" "passing" green > build_good.svg
badge "build" "failing" tomato > build_bad.svg
badge "minified size" "153.6 kB" blue > bundle.svg
badge "total lines" "24k" blue > lines.svg
badge "pipeline" "running" yellow > ci_running.svg
badge "pipeline" "failed" red > ci_bad.svg
badge "pipeline" "passed" green > ci_good.svg
badge "badges" "21" darkgreen > badges.svg
#badge "label" "message" color > file.svg

if [ "$1" != "-s" ]; then
  echo "converting SVGs to PNGs"
  find . -name '*.svg' | xargs -i convert -background white -density 2000 {} {}.png
fi
echo "randomly combining PNGs into one big PNG"
PNGS=$(find . -name '*.svg.png' | sort --random-sort)
montage -background white -geometry '+50+25' -tile 3x $PNGS badges.png
