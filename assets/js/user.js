// Firebase POC for adding user accounts
// Configuration Firebase
var config = {
    apiKey: "AIzaSyBdpZcMPZIDwRNM5RcekAkrwuzxa74FgzM",
    authDomain: "cryptocurrecny-f7eb7.firebaseapp.com",
    databaseURL: "https://cryptocurrecny-f7eb7.firebaseio.com",
    projectId: "cryptocurrecny-f7eb7",
    storageBucket: "cryptocurrecny-f7eb7.appspot.com",
    messagingSenderId: "917854135892"
};
// Initialize Firebase
firebase.initializeApp(config);
// create a variable named database to store your db connection
const db = firebase.database();

// USER ACCOUNT ====================================================================

// Create a reference to user folders
let userAcctRef = db.ref('cryptoAccounts'); // do not use keyword 'userAccount'

// Functions .......................................................
function addUserAccount(userId, userName) {

    // prepare user account object
    let userAccount = {
        userId: userId,
        userName: userName
    }
    // Add user account
    userAcctRef.push(userAccount);
}

function doesAccountExist(userId) {
    let isRecordAvailable = false;
    // Look for the trains that match the name
    userAcctRef.orderByChild('userId').equalTo(userId).on('value', data => {
        data.forEach(elementNode => {
            // If one record exist with the name, is enough
            isRecordAvailable = true;
        });
    })
    return isRecordAvailable;
}

// EVENTS ...............................................

// IMPORTAN: This must be outside a funciton.
// If inside the function, it will still be executed
userAcctRef.on('value', data => {
    //loop over all nodes
    data.forEach(elementNode => {
        // get node key and data
        var recKey = elementNode.key;
        var userAcct = elementNode.val();
    });
})

function SubmitUserAccount() {

    // Control default behavior for "submit" button
    event.preventDefault();

    // reset possible errors
    document.getElementById("userIdErr").innerHTML = '';
    document.getElementById("userNameErr").innerHTML = '';
    document.getElementById("userPwdErr").innerHTML = '';

    let userId = document.getElementById("uId").value.trim();
    let userName = document.getElementById("uName").value.trim();
    let userPwd = document.getElementById("uPwd").value.trim();

    // add user account to database
    addUserAccount(userId, userName, userPwd);

    document.getElementById('userAccts').innerHTML = '';
}

function DeleteUserAccount() {

    // Control default behavior for "submit" button
    event.preventDefault();

    // reset possible errors
    document.getElementById("userIdErr").innerHTML = '';

    // retreive data from screen
    let userId = document.getElementById("uId").value.trim();

    // Look for the record that match the id
    userAcctRef.orderByChild('userId').equalTo(userId).on('value', data => {
        data.forEach(elementNode => {
            // get key info
            let recKey = elementNode.key;
            let usrAcct = elementNode.val();

            // For the record with matching keys, delete it
            if (usrAcct.userId === userId) {
                // Delete object
                userAcctRef.child(recKey).remove();
                document.getElementById('userAccts').innerHTML = '';
            }
        });
    })
}

// USER PROTFOLIO ==========================================================

// Create a reference to user folders
let userPortfRef = db.ref('cryptoPortfolio');
var userProtfolioTotal = 0;

document.getElementById('pTotal').innerHTML = '$0.00';

function addCoinToList(userId, coinName, coinSymbol, coinHold) {

    let errorFound = false;

    // does account already exist?
    let isUserAcountExist = doesAccountExist(userId);

    if (!isUserAcountExist) {
        document.getElementById("userIdErr").innerHTML = 'Use account does not exist';
        errorFound = true;
    }

    if (!errorFound && isUserAcountExist) {

        // Get current watch list
        let usrPortfolio = getUserPortfolio(userId);
        let recKey = null;
        let curWatchList = [];
        let pos = -1;

        if (usrPortfolio != null) {
            recKey = usrPortfolio.key;
            curWatchList = usrPortfolio.val().watchList;

            // Get current coint position in protafolio 
            for (let i = 0; i < curWatchList.length; i++) {
                let element = curWatchList[i];
                if (element.coinName === coinName) {
                    pos = i;
                    break
                }
            }
        }

        // prepare portfolio object
        let userPortfolio = {
            userId: userId,
            watchList: []
        }
        // prepare coin
        let coin = {
            coinName: coinName,
            coinSymbol: coinSymbol,
            hold: coinHold
        }

        if (pos === -1) {
            // if coin not in list, add it
            userPortfolio.watchList = curWatchList;
            userPortfolio.watchList.push(coin);
        } else {
            // replace from the list first
            curWatchList.splice(pos, 1);
            userPortfolio.watchList = curWatchList;
            userPortfolio.watchList.push(coin);
        }

        // remove portfolio and, 
        if (recKey != null) {
            userPortfRef.child(recKey).remove();
        }

        // add to database 
        userPortfRef.push(userPortfolio);
    }
}

function deleteCoin(userId, coinSymbol) {

    let refreshScreen = true;

    userId = userId.trim();
    coinSymbol = coinSymbol.trim();
    let errorFound = false;

    // does account already exist?
    let isUserAcountExist = doesAccountExist(userId);
    if (!isUserAcountExist) {
        document.getElementById("userIdErr").innerHTML = 'Use account does not exist';
        errorFound = true;
    }

    if (!errorFound && isUserAcountExist) {
        // Get current watch list
        let usrPortfolio = getUserPortfolio(userId);
        let recKey = null;
        let curWatchList = [];
        let pos = -1;

        if (usrPortfolio != null) {
            recKey = usrPortfolio.key;
            curWatchList = usrPortfolio.val().watchList;

            // Get current coint position in protafolio 
            for (let i = 0; i < curWatchList.length; i++) {
                let element = curWatchList[i];
                if (element.coinSymbol === coinSymbol) {
                    pos = i;
                    break
                }
            }
        }
        // prepare portfolio object
        let userPortfolio = {
            userId: userId,
            watchList: []
        }

        if (pos > -1) {
            // replace from the list first
            curWatchList.splice(pos, 1);
            userPortfolio.watchList = curWatchList;

            // remove portfolio and, 
            if (recKey != null) {
                userPortfRef.child(recKey).remove();
            }

            // add to database only if there any coins in protfolio
            if (curWatchList.length > 0) {
                userPortfRef.push(userPortfolio);
                refreshScreen = false;
            }
        }
    }

    return refreshScreen;
}

function getUserPortfolio(userId) {

    let usrPortfolio = null;

    // Look for the trains that match the name
    userPortfRef.orderByChild('userId').equalTo(userId).on('value', data => {

        data.forEach(portfolio => {
            // use val() to retrieve the objects
            usrPortfolio = portfolio;
        })
    })

    return usrPortfolio;
}

function compareCoins(a, b) {
    if (a.coinName < b.coinName)
        return -1;
    if (a.coinName > b.coinName)
        return 1;
    return 0;
}

function prepareUserPortfolio(usrPortf) {

    document.getElementById('portfolio-data').innerHTML = '';
    document.getElementById('pTotal').innerHTML = '$0.00';
    userProtfolioTotal = 0;

    if (usrPortf.watchList !== undefined) {

        // Sort watch list by name
        coinLst = usrPortf.watchList;
        coinLst.sort(compareCoins);

        // get and process each coin in protfolio
        for (let i = 0; i < coinLst.length; i++) {
            // get the coin
            coin = coinLst[i];
            // conver to coin object
            let coinObj = new cryptoCoin(coin.coinName, coin.coinSymbol);
            coinObj.holdings = coin.hold;
            // obtain coin proce and display
            getCoinPricePortfolio(coinObj);
        }
    }
}

function getCoinPricePortfolio(coinObj) {

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

            // Display coin in protfolio view
            displayCoinInPortfolio(coinObj);

        })
        .catch(function (err) {
            console.error(err);
        })
}

function displayCoinInPortfolio(coinObj) {

    // create a new table row
    let tblRow = document.createElement('tr');
    let dollarHoldings = '';
    if (coinObj.holdings !== '') {
        priceUSD = convertDollarFomratToFloat(coinObj.priceUSD);
        dollarHoldings = coinObj.holdings * parseFloat(priceUSD);
        // compute user portfolio total
        userProtfolioTotal += parseFloat(dollarHoldings);
        // display coin holdings
        dollarHoldings = accounting.formatMoney(dollarHoldings);
        dollarHoldings = dollarHoldings + ` ( ${coinObj.holdings} )`
        // display holdings total
        userProtfolioTotalStr = accounting.formatMoney(userProtfolioTotal);
        document.getElementById('pTotal').innerHTML = userProtfolioTotalStr;

    }

    // Delete Button
    let tblCellDelBtn = tblRow.appendChild(document.createElement('td'));
    tblCellDelBtn.innerHTML = `
         <button class="btn btn-primary rowBtn" data-toggle="tooltip" title="Delete" 
              onclick="deleteCoinOnClick('${coinObj.symbol}')">
              <i class="far fa-trash-alt"></i>
         </button>
      `

    // update button
    let tblCellUpdBtn = tblRow.appendChild(document.createElement('td'));
    tblCellUpdBtn.innerHTML = `
        <button class="btn btn-primary rowBtn" data-toggle="tooltip" title="Edit" 
             onclick="updateCoinOnClick('${coinObj.name}','${coinObj.symbol}','${coinObj.priceUSD}','${coinObj.holdings}')">
           <i class="fas fa-edit"></i>
        </button>
     `

    //Coin
    let tblCellCoinName = tblRow.appendChild(document.createElement('td'));
    tblCellCoinName.innerHTML = `
         <p class="coinName">${coinObj.name}</p>
         <p class="coinSymbol">${coinObj.symbol}</p>
      `;

    //Price
    let tblCellCoinPrice = tblRow.appendChild(document.createElement('td'));
    tblCellCoinPrice.innerHTML = `
         <p class="coinPrice">${coinObj.priceUSD}</p>
         <p class="coinPrice">${dollarHoldings}</p>

     `;

    //Change
    let tblCellCoinChange = tblRow.appendChild(document.createElement('td'));
    tblCellCoinChange.innerHTML = `
        <p class="coinChange">${coinObj.change24hr}</p>
        <p class="coinChange">${coinObj.changePct24hr}</p>
      `;

    // Append card to div
    document.getElementById('portfolio-data').appendChild(tblRow);
}

function convertDollarFomratToFloat(dollarFigure) {
    // remode '$' and ',' symbols
    let dollarNumber = dollarFigure.replace('$', '');
    dollarNumber = dollarNumber.replace(',', '');
    return (parseFloat(dollarNumber))
}

// EVENTS ..................................................

// IMPORTAN: This must be outside a funciton.
// If inside the function, it will still be executed
if (localStorage.getItem('cw-username')) {
    userPortfRef.orderByChild('userId').equalTo(localStorage.getItem('cw-username')).on('value', data => {
        // clear portfolio screen
        document.getElementById('portfolio-data').innerHTML = '';
        //loop over all nodes
        data.forEach(elementNode => {
            // get node key and data
            var recKey = elementNode.key;
            var userPort = elementNode.val();
            // it will only retreive the child node that was added
            if (userPort !== null && userPort.userId === localStorage.getItem('cw-username')) {
                // dislay records here
                prepareUserPortfolio(userPort);
            }
        });
    })
}

function deleteCoinOnClick(coinSymbol) {
    // Control default behavior for "submit" button
    event.preventDefault();
    // retreive data from screen
    let userId = localStorage.getItem('cw-username');

    let refreshScreen = deleteCoin(userId, coinSymbol);
    if (refreshScreen) {
        document.getElementById('pTotal').innerHTML = '$0.00';
    }
}

function updateCoinOnClick(coinName, coinSymbol, coinPriceUSD, coinHoldings) {

    // Control default behavior for "submit" button
    event.preventDefault();

    if (localStorage.getItem('cw-username')) {

        if (document.getElementById('holdingForm').getAttribute('class') === "holdingsForm d-none") {

            // Set data-value for input with coin name and  symbol
            document.getElementById('holdingDecimals').setAttribute('data-value', coinName + "," + coinSymbol);
            // Add holding coing name 
            document.getElementById('holdingsSymbol').innerHTML = coinSymbol;
            // Add holding coing name 
            document.getElementById('coinPrice').innerHTML = coinPriceUSD;
            // Show holding decimal
            document.getElementById('holdingDecimals').value = coinHoldings;

            // Preapre holding dollars
            let dollarHoldings = 0;
            if (coinHoldings !== '') {
                priceUSD = convertDollarFomratToFloat(coinPriceUSD);
                dollarHoldings = coinHoldings * parseFloat(priceUSD);
            }
            // Holdings in dollars
            document.getElementById('holdingDollars').innerHTML = accounting.formatMoney(dollarHoldings);

            // Make Holding form visible
            document.getElementById('holdingForm').setAttribute('class', 'holdingsForm');
        } else {
            // resetset coin in data-value attribute
            document.getElementById('holdingDecimals').setAttribute('data-value', '');
            // Add holding coing name 
            // Add holding coing name 
            document.getElementById('holdingsSymbol').innerHTML = '';
            // Add holding coing name 
            document.getElementById('coinPrice').innerHTML = '';
            document.getElementById('holdingDecimals').value = '';
            // Show holding decimals
            document.getElementById('holdingDollars').innerHTML = '';
            // Make Holding form visible
            document.getElementById('holdingForm').setAttribute('class', 'holdingsForm d-none');
        }
    }
}

function saveHoldingsOnClick() {
    // Control default behavior for "submit" button
    event.preventDefault();

    // retreive data from screen
    let userId = localStorage.getItem('cw-username');

    if (localStorage.getItem('cw-username')) {

        // retrevie coin name and symbol
        let coinNameSymbol = document.getElementById('holdingDecimals').getAttribute('data-value')
        // get value from input
        let coinHoldings = document.getElementById('holdingDecimals').value;

        // separate coin nanme and symbol
        let coinArr = coinNameSymbol.split(',');
        let coinName = coinArr[0];
        let coinSymbol = coinArr[1];

        // Parese hildings
        if (coinHoldings !== '') {
            coinHoldings = parseFloat(coinHoldings);
            if (coinHoldings === 0) {
                coinHoldings = '';
            }
        }

        // add new coin
        if (coinName !== '' && coinSymbol !== '') {
            // store the coin in DB with holdings
            addCoinToList(userId, coinName, coinSymbol, coinHoldings);
        }

        // Close input screen 
        // resetset coin in data-value attribute
        document.getElementById('holdingDecimals').setAttribute('data-value', '');
        // Add holding coing name 
        // Add holding coing name 
        document.getElementById('holdingsSymbol').innerHTML = '';
        // Add holding coing name 
        document.getElementById('coinPrice').innerHTML = '';
        document.getElementById('holdingDecimals').value = '';
        // Show holding decimals
        document.getElementById('holdingDollars').innerHTML = '';
        // Make Holding form visible
        document.getElementById('holdingForm').setAttribute('class', 'holdingsForm d-none');
    }
}