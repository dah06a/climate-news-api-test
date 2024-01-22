const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 8000;

const newspapers = [
  {
    name: 'thetimes',
    domain: 'https://www.thetimes.co.uk',
    address: 'https://www.thetimes.co.uk/environment/climate-change'
  },
  {
    name: 'theguardian',
    domain: 'https://www.theguardian.com',
    address: 'https://www.theguardian.com/environment/climate-crisis'
  },
];
const articles = [];
const removeList = [
  'Log in',
  'Log in ',
  'Log out',
  'Log out ',
  'Climate crisis',
  'All stories',
  'Opinion',
  '……',
];

for (const newspaper of newspapers) {
  axios.get(newspaper.address)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    $('a[href*="climate"]', html).each(function() {
      let title = $(this).attr('href');
      if ($(this).attr('aria-label')) {
        title = $(this).attr('aria-label');
      } else if ($(this).text()) {
        title = $(this).text()
      }

      let url = $(this).attr('href');
      if (!url.includes('http')) {
        url = newspaper.domain + url;
      }

      const article = {
        title,
        url,
        source: newspaper.name
      }

      if (article.title && article.url && !removeList.includes(article.title)) {
        articles.push(article);
      }
    });
  })
  .catch(err => {
    console.error(err);
  });
}



app.get('/', (req, res) => {
  res.json('Welcome to the Climate API Tutorial')
});


app.get('/news', (req, res) => {
  res.json(articles);
});

app.get('/news/:newspaperName', (req, res) => {
  const paramName = req.params.newspaperName;
  const newspaper = newspapers.find(paper => paper.name === paramName);

  if (newspaper) {
    const filteredArticles = articles.filter(article => article.source === newspaper.name);
    res.json(filteredArticles);
  } else {
    const validNames = newspapers.map(newspaper => newspaper.name).join(', ');
    res.status(404).send('The provided newspaper name was not found.  Please try one of the following valid newspaper names:  ' + validNames);
  }
});

app.listen(PORT, () => {
  console.log(`Express server is listening on port ${PORT}.`)
});
