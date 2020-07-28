const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');

// import models
const KeywordsModel = require('../models/keywordsModel');
const FiltersModel = require('../models/filtersModel');

// init encoder parser
const urlEncoderParser = bodyParser.urlencoded({extended: false});

module.exports = (app) => {
  // render index page
  app.get('/', (req, res) => {
    res.render('index');
  });

  // get keywords
  app.get('/get-keywords', (req, res) => {
    KeywordsModel.find({}, (err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        res.json(data);
      }
    });
  });

  // add keyword
  app.post('/add-keyword', urlEncoderParser, (req, res) => {
    const newKeyword = KeywordsModel(req.body).save((err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        res.json(data);
      }
    });
  });

  // delete keyword
  app.delete('/delete-keyword/:keyword', (req, res) => {
    KeywordsModel.find({keyword: req.params.keyword}).remove((err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        res.json(data);
      }
    });
  });

  // delete all keywords
  app.delete('/delete-all-keywords-and-filters', (req, res) => {
    KeywordsModel.deleteMany({}, (e, d) => {
      if (e) {
        console.log(e);
      }
      else {
        FiltersModel.deleteMany({}, (err, data) => {
          if (err) {
            console.log(err);
          }
          else {
            res.json(data);
          }
        });
      }
    });
  });

  // add filters for search
  app.post('/add-filters', urlEncoderParser, (req, res) => {
    const newFilter = FiltersModel(req.body).save((err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        res.json(data);
      }
    });
  });

  // search for recipes
  app.get('/get-recipes', (req, res) => {
    let filter = [];

    FiltersModel.find({}, (err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        data.forEach((item, i) => {
          filter.push(item.filterCode);
        });
      }
    });

    KeywordsModel.find({}, (err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        async function scrapeRecipes() {
          const browser = await puppeteer.launch({headless: true});
          const page = await browser.newPage();

          const url = 'https://www.koket.se/search?searchtext='
          let search = [];

          for (let i = 0; i < data.length; i++) {
            search.push(data[i].keyword);
          }

          const searchStr = search.join('+');
          const filterStr = filter.join(',');

          await page.goto(url + searchStr + '&sort=popular&category_ids=' + filterStr);

          if (await page.$('.search-header') !== null) {
            await page.waitForSelector('.search-header');
            const message = [{error: 'Ingen träff'}];
            console.log(message);
            res.json(message);
          }
          else {
            await page.waitForSelector('.recipe');
            const sections = await page.$$('.recipe');
            let recipes = [];

            for (let i = 0; i < 5; i++) {
              await page.goto(url + searchStr + '&sort=popular&category_ids=' + filterStr);
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
            res.json(recipes);
          }

          console.log('Done!');
          await browser.close();
        }

        scrapeRecipes();
      }
    });
  });
}
