const fs = require('fs');
const fetch = require('node-fetch');
const dsv = require('d3-dsv');
const {timeFormat} = require('d3-time-format');

let days = [];

const ids = {};
const formatTime = timeFormat("%Y-%m-%d");

async function download(d) {
  const dateString = formatTime(d);
  const csv = dsv.csvParse(await (await fetch(`https://spotifycharts.com/regional/global/daily/${dateString}/download`)).text());
  const out = {
    date: dateString
  };
  csv.forEach(row => {
    const id = row.URL.match(/\/([^\/]*)$/)[1];
    ids[id] = {
      artist: row.Artist,
      track: row['Track Name']
    };
    out[id] = +row.Streams;
  });
  return out;
}


async function run() {
  const start = new Date('2018-03-20');
  const end = new Date('2018-03-27');
  const now = new Date(start);
  const days = [];
  while (now <= end) {
    console.log(`Downloading ${now}`);
    days.push(await download(new Date(now)));
    now.setDate(now.getDate() + 1);
  }

  fs.writeFileSync('tracks.json', JSON.stringify({
    ids,
    days
  }, null, 2));
}

run();
