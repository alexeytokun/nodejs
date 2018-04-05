var mainUrl = 'http://127.0.0.1:8000';
var authHeader = sessionStorage.getItem('token');

var wrapper = document.getElementById('wrapper');
var saveButton = document.getElementById('save');
var newUserButton = document.getElementById('createuser');
var showAll = document.getElementById('showall');

var userForm = document.getElementById('userform');
var username = document.getElementById('username');
var surname = document.getElementById('surname');
var date = document.getElementById('age');
var pass = document.getElementById('pass');
var pass2 = document.getElementById('pass2');
var role = document.getElementById('role');

var modal = document.getElementById('myModal');
var span = document.getElementById('modal_close');

var modalAlert = document.getElementById('modalWindow');
var modalAlertCloseButton = document.getElementById('closeWindow');
var alertText = document.getElementById('alert');

var country = document.getElementById('country');
var city = document.getElementById('city');
var school = document.getElementById('school');
var bio = document.getElementById('bio');

var adminBtn = document.getElementById('to_admin');

var errorsObj = {
    SERVER_CON_ERROR: 'Server connection error',
    ACCESS_DENIED_ERROR: 'Access Denied',
    DB_CON_ERROR: 'Database connection error',
    DB_QUERY_ERROR: 'Database query error',
    AUTH_ERROR: 'Wrong username or password',
    WRONG_ID_ERROR: 'Wrong user id',
    USERNAME_ERROR: 'Not unique username',
    TOKEN_TIME_ERROR: 'Relogin, please',
    VALIDATION_ERROR: 'Validation error',
    NO_USERS_ERROR: 'No users created',
    NO_CITIES_ERROR: 'No cities',
    NO_SCHOOLS_ERROR: 'No schools',
    NO_COUNTRIES_ERROR: 'No countries'
};

function validate() {
    return username.checkValidity() && surname.checkValidity() &&
    date.checkValidity() && pass.checkValidity() &&
    pass2.checkValidity() && (pass.value === pass2.value) &&
    !!+country.value && !!+city.value && !!+school.value && (/^[\w .'"?!:;,-]*$/g.test(bio.value));
}

function showAlertModal(info) {
    modalAlert.classList.add('show');
    alertText.innerHTML = info;
}

function clearForm() {
    username.value = '';
    surname.value = '';
    date.value = '';
    pass.value = '';
    pass2.value = '';
}

function saveUser(user) {
    return new Promise(function (resolve, reject) {
        var url = userForm.getAttribute('action');
        var XHR = new XMLHttpRequest();
        XHR.open('POST', url);
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XHR.setRequestHeader('User-Auth-Token', String(authHeader));
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

function deleteUser(id) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/user/' + id;
        var XHR = new XMLHttpRequest();
        XHR.open('DELETE', url);
        XHR.setRequestHeader('User-Auth-Token', String(authHeader));
        XHR.send();

        XHR.onload = function () {
            var response = JSON.parse(XHR.response);
            if (this.status === 200) {
                resolve(response.message);
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

function getUserInfo(id, flag) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/user/' + id;
        var XHR = new XMLHttpRequest();
        XHR.open('GET', url);
        XHR.setRequestHeader('User-Auth-Token', String(authHeader));
        if (flag) XHR.setRequestHeader('Info', 'info');
        XHR.send();
        XHR.onload = function () {
            var response = JSON.parse(XHR.response);
            if (this.status === 200) {
                console.log(response);
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

function showUserInfo(user) {
    var modalDiv = document.createElement('div');
    var container = document.createElement('div');
    var closeSpan = document.createElement('span');
    var table = document.createElement('table');
    var tr1 = document.createElement('tr');
    var tr2 = document.createElement('tr');

    modalDiv.classList.add('modal');
    container.setAttribute('id', 'userinfo');
    container.classList.add('modal-content');
    container.classList.add('modal-info');
    closeSpan.innerHTML = '&times;';
    container.appendChild(closeSpan).classList.add('close');
    tr1.innerHTML = '<td>Name: ' + user.username + '</td>' +
        '<td>Surname: ' + user.surname + '</td>' +
        '<td>Date: ' + user.date + '</td>' +
        '<td>Role: ' + user.role + '</td>';
    tr2.innerHTML = '<td>Country: ' + (user.country || 'No Country') + '</td>' +
        '<td>City: ' + (user.city || 'No City') + '</td>' +
        '<td>School: ' + (user.school || 'No School') + '</td>' +
        '<td>Bio: ' + (user.bio || 'No Bio') + '</td>';
    table.appendChild(tr1);
    table.appendChild(tr2);

    container.appendChild(table);
    modalDiv.appendChild(container);
    wrapper.appendChild(modalDiv);
    modalDiv.style.display = 'block';
    closeSpan.onclick = function () {
        wrapper.removeChild(modalDiv);
    };
}

function editUser(id) {
    getUserInfo(id, false)
        .then(function (response) {
            username.value = response.username;
            surname.value = response.surname;
            date.value = response.date;
            userForm.setAttribute('action', mainUrl + '/user/' + id);
            showCountriesSelect();
        }).catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

function showUser(id) {
    getUserInfo(id, true)
        .then(function (response) {
            showUserInfo(response);
        }).catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

function updateTable() {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/users';
        var XHR = new XMLHttpRequest();
        XHR.open('GET', url);
        XHR.setRequestHeader('User-Auth-Token', String(authHeader));
        XHR.send();
        clearForm();
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

function createTable(usersObj) {
    var container = document.createElement('div');
    if (document.getElementById('infotable')) {
        var elem = document.getElementById('infotable');
        elem.parentNode.removeChild(elem);
    }
    container.setAttribute('id', 'infotable');
    var table = document.createElement('table');
    usersObj.forEach(function (element) {
        if (element !== null) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>Name: ' + element.username + '</td>' +
                '<td>Surname: ' + element.surname + '</td>' +
                '<td><button class="edit">Edit</button>' +
                '<button class="del">Delete</button>' +
                '<button class="info">Info</button></td>';
            tr.setAttribute('id', element.id);
            table.appendChild(tr);
        }
    });
    container.appendChild(table);

    container.onclick = function (event) {
        var target = event.target;
        var targetId = +target.parentNode.parentNode.getAttribute('id');

        if (target.className === 'del') {
            deleteUser(targetId)
                .then(function () {
                    // showAlertModal(response.message);
                    return updateTable();
                })
                .then(function (response) {
                    createTable(response);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }

        if (target.className === 'edit') {
            editUser(targetId);
        }

        if (target.className === 'info') {
            showUser(targetId);
        }
    };

    wrapper.insertBefore(container, showAll);
}

function removeTable() {
    var container = document.getElementById('infotable');
    if (container) {
        container.parentNode.removeChild(container);
        return true;
    }
    return false;
}

function showCountriesSelect() {
    return getCountries()
        .then(function (response) {
            country.innerHTML = '<option value="">Select Country</option>';
            response.forEach(function (element) {
                var opt = document.createElement('option');
                opt.setAttribute('value', String(element.country_id));
                opt.innerHTML = element.name;
                country.appendChild(opt);
            });
            modal.classList.add('show');
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

saveButton.onclick = function () {
    var user = 'username=' + username.value + '&surname=' + surname.value + '&age=' + date.value +
    '&pass=' + pass.value + '&role=' + role.value + '&country=' + country.value + '&city=' + city.value +
    '&school=' + school.value + '&bio=' + bio.value;

    if (!validate()) {
        showAlertModal(errorsObj.VALIDATION_ERROR);
        return;
    }

    console.log(user);


    saveUser(user).then(function () {
        if (document.getElementById('infotable')) {
            updateTable()
                .then(function (response) {
                    createTable(response);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }
        clearForm();
    })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });

    userForm.setAttribute('action', mainUrl + '/user');
    modal.classList.remove('show');
};

showAll.onclick = function () {
    var flag = removeTable();
    if (!flag) {
        updateTable()
            .then(function (response) {
                createTable(response);
            })
            .catch(function (response) {
                showAlertModal(errorsObj[response.message]);
            });
    }
};

newUserButton.onclick = function () {
    showCountriesSelect();
};

span.onclick = function () {
    modal.classList.remove('show');
    userForm.setAttribute('action', mainUrl + '/user');
    clearForm();
};

// window.onclick = function (event) {
//     if (event.target === modal) {
//         modal.classList.remove('show');
//         userForm.setAttribute('action', mainUrl + '/user');
//         clearForm();
//     }
//
//     if (event.target === signIn) {
//         signIn.classList.remove('show');
//     }
//
//     if (event.target === modalAlert) {
//         modalAlert.classList.remove('show');
//     }
// };

modalAlertCloseButton.onclick = function () {
    modalAlert.classList.remove('show');
};
