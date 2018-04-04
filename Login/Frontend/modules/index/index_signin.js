var showSignIn = document.getElementById('showsignin');
var spanSignIn = document.getElementsByClassName('close')[0];

var signIn = document.getElementById('signin');
var signInButton = document.getElementById('si_save');
var siUsername = document.getElementById('si_username');
var siPassword = document.getElementById('si_password');

var signInSwitch = document.getElementById('si_switch');
var signUpSwitch = document.getElementById('switch');

function validateSignIn() {
    return siUsername.checkValidity() && siPassword.checkValidity();
}

function logOut() {
    var elem;
    if (document.getElementById('infotable')) {
        elem = document.getElementById('infotable');
        elem.parentNode.removeChild(elem);
    }
    signIn.classList.toggle('show');
}

function signInUser(user) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/signin';
        var XHR = new XMLHttpRequest();
        XHR.open('POST', url);
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XHR.send(user);
        XHR.onload = function () {
            var response = JSON.parse(XHR.response);
            if (this.status === 200) {
                resolve(response);
            } else if (this.status === 401) {
                logOut();
                reject(response);
            } else {
                reject(response);
            }
        };
        XHR.onerror = function () {
            reject({ message: 'SERVER_CON_ERROR' });
        };
    });
}

function getRole() {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/signin/role';
        var XHR = new XMLHttpRequest();
        XHR.open('GET', url);
        XHR.setRequestHeader('User-Auth-Token', String(authHeader));
        XHR.send();
        XHR.onload = function () {
            var response = JSON.parse(XHR.response);
            if (this.status === 200) {
                resolve(response);
            } else if (this.status === 401) {
                logOut();
                reject(response);
            } else {
                reject(response);
            }
        };
        XHR.onerror = function () {
            reject({ message: 'SERVER_CON_ERROR' });
        };
    });
}

adminBtn.onclick = function () {
    getRole()
        .then(function (response) {
            if (response.role === 'admin') {
                window.location.replace('admin.html');
            } else {
                throw { message: 'ACCESS_DENIED_ERROR' };
            }
        }).catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

signInButton.onclick = function () {
    var userData = 'username=' + siUsername.value + '&pass=' + siPassword.value;
    if (!validateSignIn()) {
        showAlertModal(errorsObj.VALIDATION_ERROR);
        return;
    }


    signInUser(userData)
        .then(function (response) {
            signIn.classList.remove('show');
            // if (response.role === 'admin') {
            //     window.location.replace('admin.html');
            //     return;
            // }
            authHeader = response.authtoken;
            sessionStorage.setItem('token', authHeader);
            return updateTable();
        })
        .then(function (response) {
            createTable(response);
            siUsername.value = '';
            siPassword.value = '';
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
};

showSignIn.onclick = function () {
    signIn.classList.toggle('show');
};

spanSignIn.onclick = function () {
    signIn.classList.remove('show');
};

signInSwitch.onclick = function () {
    showCountriesSelect();
    modal.classList.toggle('show');
    signIn.classList.toggle('show');
};

signUpSwitch.onclick = function () {
    modal.classList.toggle('show');
    signIn.classList.toggle('show');
};
