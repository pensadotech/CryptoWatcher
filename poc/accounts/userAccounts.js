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
// Create a reference to user folders
let userAcctRef = db.ref('cryptoAccounts'); // do not use keyword 'userAccount'

// Functions .......................................................
function addUserAccount(userId, userName, userPwd) {

  // Make sure there are not leading/tailing spaces
  userId = userId.trim();
  userName = userName.trim();
  userPwd = userPwd.trim();

  let errorFound = false;

  if (userId === '') {
    document.getElementById("userIdErr").innerHTML = 'User Id cannot be blank';
    errorFound = true;
  }

  if (userName === '') {
    document.getElementById("userNameErr").innerHTML = 'User Name cannot be blank';
    errorFound = true;
  }

  if (userPwd === '') {
    document.getElementById("userPwdErr").innerHTML = 'User password cannot be blank';
    errorFound = true;
  }

  // does account already exist?
  let isUserAcountExist = doesAccountExist(userId);

  console.log("isUserAcountExist:" + isUserAcountExist);

  if (isUserAcountExist) {
    document.getElementById("userIdErr").innerHTML = 'Use account already exist';
    errorFound = true;
  }

  // Only add if does nto exists
  if (!errorFound && !isUserAcountExist) {
    // prepare user accoun object
    let userAccount = {
      userId: userId,
      userName: userName,
      userPwd: userPwd
    }

    // Add user account
    userAcctRef.push(userAccount);

    document.getElementById("uId").value = '';
    document.getElementById("uName").value = '';
    document.getElementById("uPwd").value = '';
  }

  return (errorFound ? false : true);
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

// A FIRST access is need to tthe tables in order for function to work
function refreshUserAccounts() {
  // process all records in database
  userAcctRef.on('value', data => {
    //loop over all nodes
    data.forEach(elementNode => {
      // get node key and data
      var recKey = elementNode.key;
      var userAcct = elementNode.val();
      if (userAcct != null ) {
        displayUserAccoutns(recKey, userAcct)
      }
    });
  })
}

function displayUserAccoutns(recKey, userAcct) {
  let item = document.createElement('div');
  item.innerHTML = `
    <p>${userAcct.userId} "/" ${userAcct.userName} "/" ${userAcct.userPwd}</p>
  `
  document.getElementById('userAccts').appendChild(item);
}

// EVENT: Database record child added event ..................................
// A FIRST access is need to tthe tables in order for function to work
userAcctRef.on('child_added', data => {
  let userAcct = data.val();
  // it will only retreive teh child node that was added
  if (userAcct != null && userAcct.userId !== 'undefined') {
    displayUserAccoutns(data.key, data.val());
  }
})

// EVENTS ...............................................
function SubmitUserAccount() {

  // Control default behavior for "submit" button
  event.preventDefault();

  // reset possible errors
  document.getElementById("userIdErr").innerHTML = '';
  document.getElementById("userNameErr").innerHTML = '';
  document.getElementById("userPwdErr").innerHTML = '';

  // retreive data from screen
  let userId = document.getElementById("uId").value.trim();
  let userName = document.getElementById("uName").value.trim();
  let userPwd = document.getElementById("uPwd").value.trim();

  console.log("userId: " + userId);
  console.log("userName: " + userName);
  console.log("userPwd: " + userPwd);

  addUserAccount(userId, userName, userPwd);

  document.getElementById('userAccts').innerHTML = '';
  refreshUserAccounts();
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

      console.log("recKey: " + recKey);
      console.log("userId: " + usrAcct.userId);

      // For the record with matching keys, delete it
      if (usrAcct.userId === userId) {
        // Delete object
        userAcctRef.child(recKey).remove();
        document.getElementById('userAccts').innerHTML = '';
        refreshUserAccounts();
      }
    });
  })

 
}