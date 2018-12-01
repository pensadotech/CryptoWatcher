function displayArticles(searchNewsTopic) {

  document.getElementById('articleSource').innerHTML = searchNewsTopic;

  let sources = '';

  // Convert search topic to teh expected keywords
  switch (searchNewsTopic) {
    case "Crypto Coin news":
      sources = "crypto-coins-news";
      break;
    case "CNN":
      sources = "cnn";
      break;
    case "Bloomberg":
      sources = "bloomberg";
      break;
    case "BBC News":
      sources = "bbc-news";
      break;
    case "Google News":
      sources = "google-news";
      break;
  }

  // https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=2b0e26c842cb45dc9a1ff22e316d4359
  // https://newsapi.org/v2/top-headlines?sources=bloomberg&apiKey=2b0e26c842cb45dc9a1ff22e316d4359
  // https://newsapi.org/v2/top-headlines?sources=crypto-coins-news&apiKey=2b0e26c842cb45dc9a1ff22e316d4359
  // https://newsapi.org/v2/top-headlines?sources=business-insider&apiKey=2b0e26c842cb45dc9a1ff22e316d4359
  // https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=2b0e26c842cb45dc9a1ff22e316d4359
  // https://newsapi.org/v2/top-headlines?sources=google-news&apiKey=2b0e26c842cb45dc9a1ff22e316d4359

  let url = "https://newsapi.org/v2/top-headlines"
  url += '?sources=' + sources;
  url += '&apikey=' + "2b0e26c842cb45dc9a1ff22e316d4359";

  fetch(url)
    .then(function (response) {
      // Parse response 
      return response.json();
    })
    .then(function (data) {

      // If articles are returned, display them
      if (data.articles.length > 1) {

        for (let i = 0; i < data.articles.length; i++) {
          // get article
          let article = data.articles[i];
          // Display in screen
          displayArticle(article);
        }
      }
    })
    .catch(function (err) {
      console.error(err)
    })

}

function displayArticle(article) {

  let artCont = article.content;

  var pos = artCont.indexOf('[');
  if (pos !== -1) {
    artCont = artCont.substring(1, pos);
  }

  // Create Article HTML structure
  let articleHtml = `
      <div class="newsArticle">
        <div class="articleTitle d-inline-flex">
          <div class=" bg-primary text-white ">
             <img class="newsArtcileImg" src=${article.urlToImage} alt="">
          </div>
          <div class="bg-dark text-white pl-3">
             <h5 class="d-flex d-inline">${article.title}</h5>
           </div>
        </div>
        <a class="d-block" target="_blank" href=${article.url}> Read full article</a>
        <p id="abstract"> ${artCont}</p>
       </div>
      `;

  // append the article
  let artSect = document.getElementById('articlesSection');
  artSect.insertAdjacentHTML('beforeend', articleHtml);

}

function clearArticlesInScreen() {
  // Get an array of all articles 'div'
  let articles = document.getElementsByClassName('newsArticle');
  // store how any articles are initially
  let totalArticles = articles.length;
  // loop as many times as total articles
  // but always remove the one in position zero
  // Note: as articles are removed, they are shifted to position zero
  for (let i = 0; i < totalArticles; i++) {
    articles[0].remove();
  }
}

function getInputSelecton(elementId) {
  // get element that represent an input selector
  var elmnt = document.getElementById(elementId);
  // if not selector return null
  if (elmnt.selectedIndex == -1) {
    return null;
  }
  // return selected value
  return elmnt.options[elmnt.selectedIndex].text;
}

// EVENT: Search news .....................
function getNewsOnClick() {
  event.preventDefault();
  // search topic
  let searchNewsTopic = getInputSelecton('newsTopic');
  // clear all articles from screen
  clearArticlesInScreen();
  // // Look for artciels and display
  displayArticles(searchNewsTopic);
}

// Load intialy crypto news
displayArticles("Crypto Coin news");