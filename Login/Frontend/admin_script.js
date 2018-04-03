var mainUrl = 'http://127.0.0.1:8000';
var authHeader = sessionStorage.getItem('token');

var wrapper = document.getElementById('wrapper');
var saveButton = document.getElementById('save');
var newUserButton = document.getElementById('createuser');
var showAll = document.getElementById('showall');

var userForm = document.getElementById('userform');
var username = document.getElementById('username');
var surname = document.getElementById('surname');
var age = document.getElementById('age');
var pass = document.getElementById('pass');
var pass2 = document.getElementById('pass2');
var role = document.getElementById('role');

var modal = document.getElementById('myModal');
var span = document.getElementsByClassName('close')[1];

var modalAlert = document.getElementById('modalWindow');
var modalAlertCloseButton = document.getElementById('closeWindow');
var alertText = document.getElementById('alert');

var country = document.getElementById('country');
var city = document.getElementById('city');
var school = document.getElementById('school');
var bio = document.getElementById('bio');

var showCountires = document.getElementById('showcountires');
var showCities = document.getElementById('showcities');
var showSchools = document.getElementById('showschools');

var countryModal = document.getElementById('country_myModal');
var countryForm = document.getElementById('country_form');
var countryName = document.getElementById('country_countryname');
var countrySave = document.getElementById('country_save');
var countryFormClose = document.getElementById('country_close');

var cityModal = document.getElementById('city_myModal');
var cityForm = document.getElementById('city_form');
var cityName = document.getElementById('city_cityname');
var cityCountryName = document.getElementById('city_countryname');
var citySave = document.getElementById('city_save');
var cityFormClose = document.getElementById('city_close');

var schoolModal = document.getElementById('school_myModal');
var schoolForm = document.getElementById('school_form');
var schoolName = document.getElementById('school_schoolname');
var schoolCityName = document.getElementById('school_cityname');
var schoolCountryName = document.getElementById('school_countryname');
var schoolSave = document.getElementById('school_save');
var schoolFormClose = document.getElementById('school_close');


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
    NO_USERS_ERROR: 'No users created'
};

function validate() {
    return username.checkValidity() && surname.checkValidity() &&
        age.checkValidity() && pass.checkValidity() &&
        pass2.checkValidity() && (pass.value === pass2.value);
}

function showAlertModal(info) {
    modalAlert.classList.add('show');
    alertText.innerHTML = info;
}

function clearForm() {
    username.value = '';
    surname.value = '';
    age.value = '';
    pass.value = '';
    pass2.value = '';
}

function logOut() {
    var elem;
    if (document.getElementById('infotable')) {
        elem = document.getElementById('infotable');
        elem.parentNode.removeChild(elem);
    }
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
    var tr = document.createElement('tr');

    modalDiv.classList.add('modal');
    container.setAttribute('id', 'userinfo');
    container.classList.add('modal-content');
    container.classList.add('modal-info');
    closeSpan.innerHTML = '&times;';
    container.appendChild(closeSpan).classList.add('close');
    tr.innerHTML = '<td>Name: ' + user.username + '</td>' +
        '<td>Surname: ' + user.surname + '</td>' +
        '<td>Age: ' + user.age + '</td>' +
        '<td>Role: ' + user.role + '</td>';
    tr.setAttribute('id', user.id);
    table.appendChild(tr);

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
            age.value = response.age;
            getCountries()
                .then(function (response) {
                    country.innerHTML = '<option value="0">Select Country</option>';
                    response.forEach(function (element) {
                        var opt = document.createElement('option');
                        opt.setAttribute('value', String(element.country_id));
                        opt.innerHTML = element.name;
                        country.appendChild(opt);
                    });
                    modal.classList.add('show');
                    userForm.setAttribute('action', mainUrl + '/user/' + id);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
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

function getCountries() {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/country';
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

function getCountry(id) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/country/' + id;
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

function getCities(id) {
    return new Promise(function (resolve, reject) {
        var url;
        if (id) {
            url = mainUrl + '/city/country/' + id;
        } else {
            url = mainUrl + '/city';
        }
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

function getSchools(id) {
    return new Promise(function (resolve, reject) {
        var url;
        if (id) {
            url = mainUrl + '/school/city/' + id;
        } else {
            url = mainUrl + '/school';
        }
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

function addCountry(countryData) {
    return new Promise(function (resolve, reject) {
        var url = countryForm.getAttribute('action');
        var XHR = new XMLHttpRequest();
        XHR.open('POST', url);
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XHR.setRequestHeader('User-Auth-Token', String(authHeader));
        XHR.send(countryData);
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

function editCountry(id) {
    getCountry(id)
        .then(function (response) {
            console.log(response);
            countryName.value = response.name;
            countryForm.setAttribute('action', mainUrl + '/country/' + id);
            countryModal.classList.add('show');
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

function deleteCountry(id) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/country/' + id;
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

function addCity(cityData) {
    return new Promise(function (resolve, reject) {
        var url = cityForm.getAttribute('action');
        var XHR = new XMLHttpRequest();
        XHR.open('POST', url);
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XHR.setRequestHeader('User-Auth-Token', String(authHeader));
        XHR.send(cityData);
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

function getCity(id) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/city/' + id;
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

function editCity(id) {
    getCity(id)
        .then(function (response) {
            console.log(response);
            cityName.value = response.name;
            getCountries()
                .then(function (response) {
                    cityCountryName.innerHTML = '<option value="0">Select Country</option>';
                    response.forEach(function (element) {
                        var opt = document.createElement('option');
                        opt.setAttribute('value', String(element.country_id));
                        opt.innerHTML = element.name;
                        cityCountryName.appendChild(opt);
                    });
                    cityForm.setAttribute('action', mainUrl + '/city/' + id);
                    cityModal.classList.add('show');
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

function deleteCity(id) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/city/' + id;
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

function addSchool(schoolData) {
    return new Promise(function (resolve, reject) {
        var url = schoolForm.getAttribute('action');
        var XHR = new XMLHttpRequest();
        XHR.open('POST', url);
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XHR.setRequestHeader('User-Auth-Token', String(authHeader));
        XHR.send(schoolData);
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

function getSchool(id) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/school/' + id;
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

function editSchool(id) {
    getSchool(id)
        .then(function (response) {
            console.log(response);
            schoolName.value = response.name;
            getCountries()
                .then(function (response) {
                    schoolCountryName.innerHTML = '<option value="0">Select Country</option>';
                    response.forEach(function (element) {
                        var opt = document.createElement('option');
                        opt.setAttribute('value', String(element.country_id));
                        opt.innerHTML = element.name;
                        schoolCountryName.appendChild(opt);
                    });
                    schoolForm.setAttribute('action', mainUrl + '/school/' + id);
                    schoolModal.classList.add('show');
                    schoolCountryName.onchange = function (event) {
                        if (+event.target.value === 0) {
                            schoolCityName.innerHTML = '<option value="0">Select City</option>';
                            return;
                        }
                        getCities(schoolCountryName.value)
                            .then(function (response) {
                                schoolCityName.innerHTML = '<option value="0">Select City</option>';
                                response.forEach(function (element) {
                                    var opt = document.createElement('option');
                                    opt.setAttribute('value', String(element.city_id));
                                    opt.innerHTML = element.name;
                                    schoolCityName.appendChild(opt);
                                });
                            })
                            .catch(function (response) {
                                showAlertModal(errorsObj[response.message]);
                            });
                    };
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

function deleteSchool(id) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/school/' + id;
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

function createCountriesTable(countriesObj) {
    var container = document.createElement('div');
    if (document.getElementById('infotable')) {
        var elem = document.getElementById('infotable');
        elem.parentNode.removeChild(elem);
    }
    container.setAttribute('id', 'infotable');
    var table = document.createElement('table');
    countriesObj.forEach(function (element) {
        if (element !== null) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>Name: ' + element.name + '</td>' +
                '<td><button class="edit">Edit</button>' +
                '<button class="del">Delete</button>';
            tr.setAttribute('id', element.country_id);
            table.appendChild(tr);
        }
    });
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><button class="new">Add new</button>';
    table.appendChild(tr);
    container.appendChild(table);

    container.onclick = function (event) {
        var target = event.target;
        var targetId = +target.parentNode.parentNode.getAttribute('id');

        if (target.className === 'del') {
            deleteCountry(targetId)
                .then(function () {
                    return getCountries();
                })
                .then(function (response) {
                    createCountriesTable(response);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }

        if (target.className === 'new') {
            countryModal.classList.add('show');
        }

        if (target.className === 'edit') {
            editCountry(targetId);
        }
    };

    wrapper.insertBefore(container, showAll);
}

function createCitiesTable(citiesObj) {
    var container = document.createElement('div');
    if (document.getElementById('infotable')) {
        var elem = document.getElementById('infotable');
        elem.parentNode.removeChild(elem);
    }
    container.setAttribute('id', 'infotable');
    var table = document.createElement('table');
    citiesObj.forEach(function (element) {
        if (element !== null) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>Name: ' + element.name + '</td>' +
                '<td>Country: ' + element.country + '</td>' +
                '<td><button class="edit">Edit</button>' +
                '<button class="del">Delete</button>';
            tr.setAttribute('id', element.city_id);
            table.appendChild(tr);
        }
    });
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><button class="new">Add new</button>';
    table.appendChild(tr);
    container.appendChild(table);

    container.onclick = function (event) {
        var target = event.target;
        var targetId = +target.parentNode.parentNode.getAttribute('id');

        if (target.className === 'del') {
            deleteCity(targetId)
                .then(function () {
                    return getCities();
                })
                .then(function (response) {
                    createCitiesTable(response);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }

        if (target.className === 'new') {
            getCountries()
                .then(function (response) {
                    cityCountryName.innerHTML = '<option value="0">Select Country</option>';
                    response.forEach(function (element) {
                        var opt = document.createElement('option');
                        opt.setAttribute('value', String(element.country_id));
                        opt.innerHTML = element.name;
                        cityCountryName.appendChild(opt);
                    });
                    cityModal.classList.add('show');
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }

        if (target.className === 'edit') {
            editCity(targetId);
        }
    };

    wrapper.insertBefore(container, showAll);
}

function createSchoolsTable(schoolsObj) {
    var container = document.createElement('div');
    if (document.getElementById('infotable')) {
        var elem = document.getElementById('infotable');
        elem.parentNode.removeChild(elem);
    }
    container.setAttribute('id', 'infotable');
    var table = document.createElement('table');
    schoolsObj.forEach(function (element) {
        if (element !== null) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>Name: ' + element.name + '</td>' +
                '<td>City: ' + element.city + '</td>' +
                '<td><button class="edit">Edit</button>' +
                '<button class="del">Delete</button>';
            tr.setAttribute('id', element.school_id);
            table.appendChild(tr);
        }
    });
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><button class="new">Add new</button>';
    table.appendChild(tr);
    container.appendChild(table);

    container.onclick = function (event) {
        var target = event.target;
        var targetId = +target.parentNode.parentNode.getAttribute('id');

        if (target.className === 'del') {
            deleteSchool(targetId)
                .then(function () {
                    return getSchools();
                })
                .then(function (response) {
                    createSchoolsTable(response);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }

        if (target.className === 'new') {
            getCountries()
                .then(function (response) {
                    schoolCountryName.innerHTML = '<option value="0">Select Country</option>';
                    response.forEach(function (element) {
                        var opt = document.createElement('option');
                        opt.setAttribute('value', String(element.country_id));
                        opt.innerHTML = element.name;
                        schoolCountryName.appendChild(opt);
                    });
                    schoolModal.classList.add('show');
                    schoolCountryName.onchange = function (event) {
                        if (+event.target.value === 0) {
                            schoolCityName.innerHTML = '<option value="0">Select City</option>';
                            return;
                        }
                        getCities(schoolCountryName.value)
                            .then(function (response) {
                                schoolCityName.innerHTML = '<option value="0">Select City</option>';
                                response.forEach(function (element) {
                                    var opt = document.createElement('option');
                                    opt.setAttribute('value', String(element.city_id));
                                    opt.innerHTML = element.name;
                                    schoolCityName.appendChild(opt);
                                });
                            })
                            .catch(function (response) {
                                showAlertModal(errorsObj[response.message]);
                            });
                    };
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }

        if (target.className === 'edit') {
            editSchool(targetId);
        }
    };

    wrapper.insertBefore(container, showAll);
}

saveButton.onclick = function () {
    var user = 'username=' + username.value + '&surname=' + surname.value + '&age=' + age.value +
        '&pass=' + pass.value + '&role=' + role.value + '&country=' + country.value + '&city=' + city.value +
        '&school=' + school.value + '&bio=' + bio.value;

    if (!validate()) {
        showAlertModal(errorsObj.VALIDATION_ERROR);
        return;
    }


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
    var container = document.getElementById('infotable');
    if (container) {
        container.parentNode.removeChild(container);
    } else {
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
    getCountries()
        .then(function (response) {
            country.innerHTML = '<option value="0">Select Country</option>';
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
};


span.onclick = function () {
    modal.classList.remove('show');
    userForm.setAttribute('action', mainUrl + '/user');
    clearForm();
};

window.onclick = function (event) {
    if (event.target === modal) {
        modal.classList.remove('show');
        userForm.setAttribute('action', mainUrl + '/user');
        clearForm();
    }

    if (event.target === modalAlert) {
        modalAlert.classList.remove('show');
    }
};

modalAlertCloseButton.onclick = function () {
    modalAlert.classList.remove('show');
};

country.onchange = function (event) {
    if (+event.target.value === 0) {
        city.innerHTML = '<option value="0">Select City</option>';
        school.innerHTML = '<option value="0">Select School</option>';
        return;
    }
    getCities(country.value)
        .then(function (response) {
            city.innerHTML = '<option value="0">Select City</option>';
            response.forEach(function (element) {
                var opt = document.createElement('option');
                opt.setAttribute('value', String(element.city_id));
                opt.innerHTML = element.name;
                city.appendChild(opt);
            });
            school.innerHTML = '<option value="0">Select School</option>';
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

city.onchange = function (event) {
    if (+event.target.value === 0) {
        school.innerHTML = '<option value="0">Select School</option>';
        return;
    }
    getSchools(city.value)

        .then(function (response) {
            school.innerHTML = '<option value="0">Select School</option>';
            response.forEach(function (element) {
                var opt = document.createElement('option');
                opt.setAttribute('value', String(element.school_id));
                opt.innerHTML = element.name;
                school.appendChild(opt);
            });
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

showCountires.onclick = function () {
    var container = document.getElementById('infotable');
    if (container) {
        container.parentNode.removeChild(container);
    } else {
        getCountries()
            .then(function (response) {
                createCountriesTable(response);
            })
            .catch(function (response) {
                showAlertModal(errorsObj[response.message]);
            });
    }
}

showCities.onclick = function () {
    var container = document.getElementById('infotable');
    if (container) {
        container.parentNode.removeChild(container);
    } else {
        getCities()
            .then(function (response) {
                createCitiesTable(response);
            })
            .catch(function (response) {
                showAlertModal(errorsObj[response.message]);
            });
    }
}

showSchools.onclick = function () {
    var container = document.getElementById('infotable');
    if (container) {
        container.parentNode.removeChild(container);
    } else {
        getSchools()
            .then(function (response) {
                createSchoolsTable(response);
            })
            .catch(function (response) {
                showAlertModal(errorsObj[response.message]);
            });
    }
}

countryFormClose.onclick = function () {
    countryModal.classList.remove('show');
    countryForm.setAttribute('action', mainUrl + '/country');
}

countrySave.onclick = function () {
    var countryData = 'name=' + countryName.value;

    // if (!validate()) {
    //     showAlertModal(errorsObj.VALIDATION_ERROR);
    //     return;
    // }
    addCountry(countryData).then(function () {
        if (document.getElementById('infotable')) {
            getCountries()
                .then(function (response) {
                    createCountriesTable(response);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }
        countryName.value = '';
    })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });

    countryModal.classList.remove('show');
    countryForm.setAttribute('action', mainUrl + '/country');
}

cityFormClose.onclick = function () {
    cityModal.classList.remove('show');
    cityForm.setAttribute('action', mainUrl + '/city');
}

citySave.onclick = function () {
    var cityData = 'cityname=' + cityName.value + '&countryname=' + cityCountryName.value;
    console.log(cityData);
    // if (!validate()) {
    //     showAlertModal(errorsObj.VALIDATION_ERROR);
    //     return;
    // }
    addCity(cityData).then(function () {
        if (document.getElementById('infotable')) {
            getCities()
                .then(function (response) {
                    createCitiesTable(response);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }
        cityName.value = '';
    })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });

    cityModal.classList.remove('show');
    cityForm.setAttribute('action', mainUrl + '/city');
};

schoolFormClose.onclick = function () {
    schoolModal.classList.remove('show');
    schoolForm.setAttribute('action', mainUrl + '/school');
}

schoolSave.onclick = function () {
    var schoolData = 'schoolname=' + schoolName.value + '&cityname=' + schoolCityName.value;
    console.log(schoolData);
    // if (!validate()) {
    //     showAlertModal(errorsObj.VALIDATION_ERROR);
    //     return;
    // }
    addSchool(schoolData).then(function () {
        if (document.getElementById('infotable')) {
            getSchools()
                .then(function (response) {
                    createSchoolsTable(response);
                })
                .catch(function (response) {
                    showAlertModal(errorsObj[response.message]);
                });
        }
        schoolName.value = '';
    })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });

    schoolModal.classList.remove('show');
    schoolForm.setAttribute('action', mainUrl + '/school');
};
