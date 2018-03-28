const fs = require("fs");
const fetch = require("node-fetch");
const { csvParse, timeFormat, timeParse, timeWeek, nest, sum } = require("d3");

const timeFormatter = timeFormat("%Y-%m-%d");
const timeParser = timeParse("%Y-%m-%d");

function run() {
  let idMap = {};
  let weeks = [];
  let filenames = fs.readdirSync("data").sort();
  const out = {};

  for (let filename of filenames) {
    let date = timeParser(filename.replace(".csv", ""));
    let rows = csvParse(fs.readFileSync(`data/${filename}`, "utf8"));

    rows.forEach(row => {
      const id = row.URL.match(/\/([^\/]*)$/)[1];
      idMap[id] = {
        artist: row.Artist,
        track: row["Track Name"]
      };
      if (!out[id]) out[id] = [];
      out[id].push({ date, streams: +row.Streams });
    });
  }

  for (let id in out) {
    out[id] = nest()
      .key(({ date }) => {
        return timeWeek(date);
      })
      .rollup(val => sum(val.map(({ streams }) => streams)))
      .entries(out[id])
      .map(({ key, value }) => {
        return {
          date: timeFormatter(new Date(key)),
          streams: value
        };
      });
  }

  fs.writeFileSync(
    "tracks.json",
    JSON.stringify({
      idMap,
      out
    })
  );
}

run();
