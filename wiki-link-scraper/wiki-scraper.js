const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Set link and depth here
// Link must be a valid Wikipedia link
// Depth must be an integer between 1 and 3
const START_LINK = 'https://en.wikipedia.org/wiki/Bosnia_and_Herzegovina';
const DEPTH = 3;
const OUTPUT_CSV = path.join(__dirname, 'wiki_links_output.csv');
const OUTPUT_TXT = path.join(__dirname, 'wiki_links_output.txt');

(async () => {
  if (!/^https:\/\/[a-z]{2,3}\.wikipedia\.org\/wiki\/[^ ]+$/.test(START_LINK)) {
    console.log('❌ Error: Invalid Wikipedia link.');
    return;
  }

  if (isNaN(DEPTH) || DEPTH < 1 || DEPTH > 3) {
    console.log('❌ Error: DEPTH must be an integer between 1 and 3.');
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const visited = new Set();
  const depthResults = {};

  let queue = [START_LINK];

  for (let depth = 1; depth <= DEPTH; depth++) {
    const nextQueue = [];
    const currentDepthLinks = [];

    for (const currentUrl of queue) {
      if (visited.has(currentUrl)) continue;

      await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });

      const links = await page.$$eval('#mw-content-text a', anchors =>
        anchors
          .map(a => a.getAttribute('href'))
          .filter(href =>
            href &&
            href.startsWith('/wiki/') &&
            !href.includes(':')
          )
      );

      const newLinks = [];
      for (const href of links) {
        const fullUrl = 'https://en.wikipedia.org' + href;
        if (!visited.has(fullUrl) && newLinks.length < 10) {
          newLinks.push(fullUrl);
        }
      }

      visited.add(currentUrl);
      currentDepthLinks.push(...newLinks);
      nextQueue.push(...newLinks);
    }

    depthResults[depth] = currentDepthLinks;
    queue = nextQueue;
  }

  await browser.close();

  // ✅ Save to CSV
  const csvLines = [['Depth Level', 'Link']];
  for (const [depth, links] of Object.entries(depthResults)) {
    for (const link of links) {
      csvLines.push([depth, link]);
    }
  }
  fs.writeFileSync(OUTPUT_CSV, csvLines.map(row => row.join(',')).join('\n'), 'utf8');

  // ✅ Save to TXT 
  const txtLines = [];
  for (const [depth, links] of Object.entries(depthResults)) {
    txtLines.push(`\n📘 Depth ${depth}:\n`);
    links.forEach(link => txtLines.push(link));
  }
  fs.writeFileSync(OUTPUT_TXT, txtLines.join('\n'), 'utf8');

  // ✅ Log to console
  console.log('\n✅ Unique links collected:');
  for (const [depth, links] of Object.entries(depthResults)) {
    console.log(`\n🔹 Depth ${depth}:`);
    links.forEach(link => console.log('  ' + link));
  }

  console.log(`\n📄 Results saved to:\n- CSV: ${OUTPUT_CSV}\n- TXT: ${OUTPUT_TXT}`);
})();
