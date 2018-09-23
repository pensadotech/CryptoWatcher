// Crypto currency information

// OBJECT CONSTRUCTORS ................................................
function cryptoCoin(name, symbol) {
  this.name = name;
  this.symbol = symbol;
  this.holdings = 0;
  this.priceUSD = '';
  this.change24hr = '';
  this.changePct24hr = '';
  this.imageUrl = '';
}

// FUNCTIONS ...........................................
function getTopCurrenciesByVolume() {

  // Clear list in the screen 
  clearCoinListInScreen();

  // To Exchanges volume data by pairToplist by Total Volume
  let url = 'https://min-api.cryptocompare.com/data/top/totalvol?limit=10&tsym=USD';

  fetch(url)
    .then(function (response) {
      // Parse response 
      return response.json();
    })
    .then(function (data) {
      // get root object
      const dataObj = data.Data;
      // for each coin create a cryptoCoin object 
      dataObj.forEach(element => {
        let coinObj = new cryptoCoin(element.CoinInfo.FullName, element.CoinInfo.Name);
        coinObj.NetHashesPerSecond = element.CoinInfo.NetHashesPerSecond;
        coinObj.imageUrl = element.CoinInfo.ImageUrl;
        coinObj.blockReward = element.CoinInfo.BlockReward;;
        // get price and display
        getCoinPrice(coinObj);
      });
    })
    .catch(function (err) {
      console.error(err);
    })
}

function searchCurrencies(searchTxt) {

  // Clear list in the screen 
  clearCoinListInScreen();

  // search for all coins
  let url = 'https://min-api.cryptocompare.com/data/all/coinlist';
  let coinSymbol = searchTxt.trim();
  coinSymbol = coinSymbol.toUpperCase();

  fetch(url)
    .then(function (response) {
      // Parse response 
      return response.json();
    })
    .then(function (data) {
      // get root object
      const dataObj = data.Data;

      // Conver object into array
      const coinArr = convertObjectToArray(dataObj);
      // inspect all coin names
      for (let i = 0; i < coinArr.length; i++) {
        // Get coin from array
        let coin = coinArr[i];
        // add if coin symbol matches search text  
        if (coin.Symbol.startsWith(coinSymbol)) {
          // create coin object
          let coinObj = new cryptoCoin(coin.FullName, coin.Symbol);
          coinObj.TotalCoinSupply = coin.TotalCoinSupply;
          // get price and display
          getCoinPrice(coinObj);
        }
      }
    })
    .catch(function (err) {
      console.error(err);
    })
}

function getCoinPrice(coinObj) {
  // get USD price
  let url = 'https://min-api.cryptocompare.com/data/pricemultifull';
  url += '?fsyms=' + coinObj.symbol;
  url += '&tsyms=USD';

  fetch(url)
    .then(function (response) {
      // Parse response 
      return response.json();
    })
    .then(function (data) {

      // Get root object
      const dataObj = data.DISPLAY;
      const displayArray = convertObjectToArray(dataObj);
      const coinArr = convertObjectToArray(displayArray);
      const infoArr = coinArr[0];
      // add price propreties
      coinObj.priceUSD = infoArr.USD['PRICE'];
      coinObj.change24hr = infoArr.USD['CHANGE24HOUR'];
      coinObj.changePct24hr = infoArr.USD['CHANGEPCT24HOUR'] + " %";

      // Display coin
      displayCoin(coinObj);

    })
    .catch(function (err) {
      console.error(err);
    })
}

function displayCoin(cryptoCoin) {
  // create a new table row
  let tblRow = document.createElement('tr');
  let tblCellAddBtn = tblRow.appendChild(document.createElement('td'));
  tblCellAddBtn.innerHTML = `
        <button class="btn btn-primary rowBtn" data-toggle="tooltip" 
               title="Add" 
               onclick="addCoinToPortfolio('${cryptoCoin.name}','${cryptoCoin.symbol}')">
           <i class="fas fa-plus-circle"></i>
        </button>
      `
  //Coin
  let tblCellCoinName = tblRow.appendChild(document.createElement('td'));
  tblCellCoinName.innerHTML = `
        <h5 class="coinName">${cryptoCoin.name}</h5>
        <h6 class="coinSymbol">${cryptoCoin.symbol}</h6>
     `;

  //Price
  let tblCellCoinPrice = tblRow.appendChild(document.createElement('td'));
  tblCellCoinPrice.innerHTML = `
        <span class="coinPrice">${cryptoCoin.priceUSD}</span>
     `;

  //Change
  let tblCellCoinChange = tblRow.appendChild(document.createElement('td'));
  tblCellCoinChange.innerHTML = `
         <p class="coinChange">${cryptoCoin.change24hr}</p>
         <p class="coinChange">${cryptoCoin.changePct24hr}</p>
      `;

  // Append card to div
  document.getElementById('coin-data').appendChild(tblRow);

}

function clearCoinListInScreen() {
  document.getElementById('coin-data').innerHTML = '';
}

function enableSearch() {
  document.getElementById('btnSearch').disabled = false;
  document.getElementById('searchText').disabled = false;
}

function disableSearch() {
  document.getElementById('searchText').value = '';
  document.getElementById('btnSearch').disabled = true;
  document.getElementById('searchText').disabled = true;
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

function convertObjectToArray(dataObj) {
  // Conver object into array
  let coinArray = Object.keys(dataObj).map(i => dataObj[i]);
  return coinArray;
}

// EVENT: Action in screen .....................
function refreshCoins() {
  event.preventDefault();
  // action 
  let actionSelection = getInputSelecton('actionSelection');
  // Take action 
  switch (actionSelection) {
    case "Top currencies":
      getTopCurrenciesByVolume();
      break;
    case "Search":
      let searchTxt = document.getElementById('searchText').value;
      // search for coin 
      if (searchTxt !== '') {
        searchCurrencies(searchTxt);
        break;
      }
  }
}

function actionSelectionOnClick() {
  event.preventDefault();
  // action 
  let actionSelection = getInputSelecton('actionSelection');
  // Take action 
  switch (actionSelection) {
    case "Top currencies":
      disableSearch();
      getTopCurrenciesByVolume();
      break;
    case "Search":
      enableSearch();
      break;
  }
}

function searchOnClick() {
  event.preventDefault()
  let searchTxt = document.getElementById('searchText').value;
  // search for coin 
  if (searchTxt !== '') {
    searchCurrencies(searchTxt);
  }
}

function addCoinToPortfolio(coinName, coinSymbol) {

  event.preventDefault();

  // Get user from local storage 
  let userId = localStorage.getItem('cw-username');
  let coinHold = '';
  
  // add coin to portfolio, only if user is logged in
  if (localStorage.getItem('cw-username')) {
    // add new coin
    addCoinToList(userId,coinName, coinSymbol, coinHold);
  }
}

// Initialy open top coins
getTopCurrenciesByVolume();