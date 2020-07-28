const puppeteer = require('puppeteer');

async function scrapeRecipes(url, search) {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  await page.goto(url + search);
  await page.waitForSelector('.recipe');
  const sections = await page.$$('.recipe');
  let recipes = [];

  for (let i = 0; i < sections.length; i++) {
    page.goto(url + search);
    await page.waitForSelector('.recipe');
    const sections = await page.$$('.recipe');

    const section = sections[i];

    await page.waitForSelector('.top');
    const titleEl = await section.$('.top h2 a');
    const title = await page.evaluate(titleEl => titleEl.innerText, titleEl);

    const authorEl = await section.$('a.chef');
    const author = await page.evaluate(authorEl => {
      return authorEl ? authorEl.innerText : '';
    }, authorEl);

    await page.waitForSelector('li.list-item__time-meta');
    const timeEl = await section.$('li.list-item__time-meta');
    const time = await page.evaluate(timeEl => {
      return timeEl ? timeEl.innerText : '';
    }, timeEl);

    const titleHref = await page.evaluate(titleEl => titleEl.getAttribute('href'), titleEl);
    await page.goto('https://www.koket.se' + titleHref);
    await page.waitForSelector('.ingredients');
    const ingredients = await page.$$('li .ingredient');
    let ingredientsList = [];

    for (const ingredient of ingredients) {
      const contentEl = await ingredient.$('span');
      const content = await page.evaluate(contentEl => contentEl.innerText, contentEl);
      ingredientsList.push(content);
    }

    await page.waitForSelector('ol[itemprop="recipeInstructions"]');
    const instructions = await page.$$('ol[itemprop="recipeInstructions"] li');
    let instructionsList = [];

    for (const instruction of instructions) {
      const contentEl = await instruction.$('span');
      const content = await page.evaluate(contentEl => contentEl.innerText, contentEl);
      instructionsList.push(content);
    }

    recipes.push({
      Title: title,
      Author: author,
      Time: time,
      Ingredients: ingredientsList,
      Instructions: instructionsList
    });
    console.log('Recipe added!');
  }
  console.log(recipes);

  const contentCard = $('#contentCard');

  for (let i = 0; i < recipes.length; i++) {
    let cur = recipes[i];

    contentCard.append(`
      <div class="row">
        <div class="col-4">
          <h3>${cur.Title}</h3>
        </div>
        <div class="col-4">
          <h3>${cur.Author}</h3>
        </div>
        <div class="col-4">
          <h3>${cur.Time}</h3>
        </div>
        <div class="col-6">
          <ul class="list-group" id="ingredients"></ul>
        </div>
        <div class="col-6">
          <ul class="list-group" id="instructions"></ul>
        </div>
        <div class="col-12">
          <hr>
        </div>
      </div>
    `);

    for (const ingredient of ingredientsList) {
      $('#ingredients').append(`
        <li class="list-item">
          <h5>${ingredient}</h5>
        </li>
      `);
    }

    for (const instruction of instructionsList) {
      $('#instructions').append(`
        <li class="list-item">
          <h5>${instruction}</h5>
        </li>
      `);
    }
  }

  await browser.close();
}

scrapeRecipes('https://www.koket.se/search?searchtext=', 'paprika');
