const fs = require('fs');
const fetch = require('node-fetch');
const {timeFormat} = require('d3-time-format');

const formatTime = timeFormat("%Y-%m-%d");

async function download(d) {
  const dateString = formatTime(d);
  let resp = await fetch(`https://spotifycharts.com/regional/global/daily/${dateString}/download`);
  if (!resp.ok) {
    throw new Error(`bad response on ${dateString}`);
  }
  fs.writeFileSync(`data/${dateString}.csv`, (await resp.text()));
}


async function run() {
  const start = new Date('2017-01-02');
  const end = new Date('2018-03-27');
  const now = new Date(start);
  while (now <= end) {
    const dateString = formatTime(now);
    if (!fs.existsSync(`data/${dateString}.csv`)) {
      console.log(`Downloading ${dateString}...`);
      await download(new Date(now));
    } else {
      console.log(`[skipped ${dateString}]`);
    }
    now.setDate(now.getDate() + 1);
  }
}

run();
