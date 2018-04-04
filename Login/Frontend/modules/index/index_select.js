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

function getCities(id) {
    return new Promise(function (resolve, reject) {
        var url = mainUrl + '/city/country/' + id;
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
        var url = mainUrl + '/school/city/' + id;
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