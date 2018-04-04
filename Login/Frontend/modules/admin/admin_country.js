var showCountires = document.getElementById('showcountires');

var countryModal = document.getElementById('country_myModal');
var countryForm = document.getElementById('country_form');
var countryName = document.getElementById('country_countryname');
var countrySave = document.getElementById('country_save');
var countryFormClose = document.getElementById('country_close');

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
