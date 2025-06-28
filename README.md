# Wikipedia Link Scraper (Playwright + JavaScript)

This script recursively scrapes internal Wikipedia links starting from a given article, following up to 3 levels deep. It's built with Playwright and JavaScript.



1. Make sure you have installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)

2. Clone repository

3. Install dependecies
- npm install

4. Install Playwright
- npx playwright install


Open the wiki-scraper.js and at the top of the page define
- const START_LINK = 'https://en.wikipedia.org/wiki/Automation'; // or any valid Wikipedia article
- const DEPTH = 2; // Set depth between 1 and 3

Run the script using "node wiki-scraper.js"

The script will:
- Print the collected links grouped by depth in your terminal
- Save the output to two files in the project directory:
  - wiki_links_output.csv – main structured output
  - wiki_links_output.txt – optional readable grouped format
