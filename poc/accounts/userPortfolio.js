// Firebase POC for adding user portfolio
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
// Create a reference to user folders
let userAcctRef = db.ref('cryptoAccounts'); // do not use keyword 'userAccount'
let userPortfRef = db.ref('cryptoPortfolio');

function addCoinToList(userId,coinName,coinSymbol,coinHold) {

    userId = userId.trim();
    coinName = coinName.trim();
    coinHold = coinHold.trim();
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
        let usrProtfolio = getUserProtfolio(userId);
        let recKey = null;
        let curWatchList = [];
        let pos = -1;

        if (usrProtfolio != null) {
            recKey = usrProtfolio.key;
            curWatchList = usrProtfolio.val().watchList;

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

        // remove protfolio and, 
        if (recKey != null) {
            userPortfRef.child(recKey).remove();
        }

        // add to database 
        userPortfRef.push(userPortfolio);
    }
}

function deleteCoin(userId, coinSymbol) {

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
        let usrProtfolio = getUserProtfolio(userId);
        let recKey = null;
        let curWatchList = [];
        let pos = -1;

        if (usrProtfolio != null) {
            recKey = usrProtfolio.key;
            curWatchList = usrProtfolio.val().watchList;

            // Get current coint position in p0rtafolio 
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

            // remove protfolio and, 
            if (recKey != null) {
                userPortfRef.child(recKey).remove();
            }

            // add to database 
            userPortfRef.push(userPortfolio);
        }
    }
}

// Duplicate function with userAccounts.js (remove when centralazing all)
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

function getUserProtfolio(userId) {

    let usrProtfolio = null;

    // Look for the trains that match the name
    userPortfRef.orderByChild('userId').equalTo(userId).on('value', data => {
        data.forEach(protfolio => {
            // use val() to retrieve the objects
            usrProtfolio = protfolio;
        })
    })

    return usrProtfolio;
}

// A FIRST access is need to tthe tables in order for function to work
function refreshUserAccounts() {
    // process all records in database
    userAcctRef.on('value', data => {
        //loop over all nodes
        data.forEach(elementNode => {
            // get node key and data
            var recKey = elementNode.key;
            var userAcct = elementNode.val();

            // just to make app aware uf user accounts
        });
    })
}

function refreshUserPortflio() {
    // process all records in database
    userPortfRef.on('value', data => {
        //loop over all nodes
        data.forEach(elementNode => {
            // get node key and data
            var recKey = elementNode.key;
            var userPortf = elementNode.val();
            if (userPortf != null ) {
                displayUserPortfolio(recKey, userPortf)
              }
        });
    })
}

function displayUserPortfolio(recKey, usrPortf) {
   
    for( let i = 0; i < usrPortf.watchList.length; i++) {
        
        coin = usrPortf.watchList[i];

        let item = document.createElement('div');
        item.innerHTML = `
        <p>${usrPortf.userId} "/" ${coin.coinName} "/" ${coin.hold}</p>
      `
      document.getElementById('usrPprotfolio').appendChild(item);
    }


}

// EVENT: Database record child added event ..................................
userPortfRef.on('child_added', data => {
    let userPort = data.val();
    // it will only retreive teh child node that was added
    if (userPort != null) {
        // dislay records here
        displayUserPortfolio(data.key, data.val());
    }
})

function SubmitCoin() {
    // Control default behavior for "submit" button
    event.preventDefault();

    // retreive data from screen
    let userId = document.getElementById("uId").value.trim();
    let coinName = document.getElementById("cName").value.trim();
    let coinSymbol = document.getElementById("cSymbol").value.trim();
    let coinHold = document.getElementById("cHold").value.trim();
    let isFav = document.getElementById("cFav").checked;

    console.log("to Add/Update");
    console.log(userId);
    console.log(coinName);
    console.log(coinSymbol);
    console.log(coinHold);

    addCoinToList(userId,coinName,coinSymbol,coinHold);
    
    document.getElementById('usrPprotfolio').innerHTML = '';
    refreshUserPortflio();
}

function SubmitDeleteCoin() {
    // Control default behavior for "submit" button
    event.preventDefault();
    // retreive data from screen
    let userId = document.getElementById("uId").value.trim();
    let coinName = document.getElementById("cName").value.trim();

    console.log("to Delete");
    console.log(userId);
    console.log(coinName);

    deleteCoin(userId, coinName);
    document.getElementById('usrPprotfolio').innerHTML = '';
    refreshUserPortflio();
}

refreshUserAccounts();
refreshUserPortflio();