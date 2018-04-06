var showCities = document.getElementById('showcities');

var cityModal = document.getElementById('city_myModal');
var cityForm = document.getElementById('city_form');
var cityName = document.getElementById('city_cityname');
var cityCountryName = document.getElementById('city_countryname');
var citySave = document.getElementById('city_save');
var cityFormClose = document.getElementById('city_close');

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
    tr.innerHTML = '<td class="new-td"><button class="new">Add new</button>';
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

showCities.onclick = function () {
    removeTable();
    getCities()
        .then(function (response) {
            createCitiesTable(response);
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
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
