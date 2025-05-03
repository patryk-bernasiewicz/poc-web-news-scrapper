import * as playwright from 'playwright';
import slugify from 'slugify';

const pages = [
  {
    url: 'https://podatki.gazetaprawna.pl/',
    containerSelector: 'div.listItem',
    dateSelector: 'time.datePublished',
    dateSearchText: 'dzisiaj',
    titleSelector: 'div.itemTitle',
    leadSelector: 'p.lead',
  },
];
const keywords = ['podatki', 'podatkowe', 'zmiany', 'vat', 'pit', 'ustawa'];

type FoundArticle = {
  text: string;
  confidence: number;
  link?: string;
  slug: string;
};

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();

  const page = await context.newPage();

  const foundArticles: FoundArticle[] = [];

  for (const entry of pages) {
    await page.goto(entry.url);
    console.log(`Visiting ${entry.url}`);

    console.log(await page.innerHTML('body'));
    await page.waitForSelector(entry.containerSelector, {
      timeout: 10000,
    });

    const containers = await page.$$(entry.containerSelector);
    for (const container of containers) {
      const date = await container.$(entry.dateSelector);
      if (!date) {
        continue;
      }

      const dateText = await date.innerText();
      if (
        !dateText.toLowerCase().includes(entry.dateSearchText.toLowerCase())
      ) {
        break;
      }

      const title = await container.$(entry.titleSelector);
      const titleText = (await title?.innerText()) || 'Nieznany tytuł!';
      const lead = await container.$(entry.leadSelector);
      const leadText = (await lead?.innerText()) || 'Brak opisu!';
      const link = await container.getAttribute('href');

      const slug = slugify(titleText, {
        lower: true,
        strict: true,
      });

      foundArticles.push({
        text: `${titleText} ${leadText}`,
        confidence: 0,
        link: link || undefined,
        slug,
      });
    }
  }

  await browser.close();

  console.log(JSON.stringify(foundArticles));
})();
