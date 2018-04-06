var showSchools = document.getElementById('showschools');

var schoolModal = document.getElementById('school_myModal');
var schoolForm = document.getElementById('school_form');
var schoolName = document.getElementById('school_schoolname');
var schoolCityName = document.getElementById('school_cityname');
var schoolCountryName = document.getElementById('school_countryname');
var schoolSave = document.getElementById('school_save');
var schoolFormClose = document.getElementById('school_close');

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

function editSchool(id, oldCityId) {
    var table = document.getElementById('infotable');
    table.dataset.oldid = oldCityId;
    getSchool(id)
        .then(function (response) {
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
            var oldCity = element.city_id;
            tr.innerHTML = '<td>Name: ' + element.name + '</td>' +
                '<td>City: ' + (element.city || 'No City') + '</td>' +
                '<td><button class="edit" data-id=' + oldCity + '>Edit</button>' +
                '<button class="del">Delete</button>';
            tr.setAttribute('id', element.school_id);
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
            editSchool(targetId, target.dataset.id);
        }
    };

    wrapper.insertBefore(container, showAll);
}

function validateShoolForm() {
    return schoolName.checkValidity() &&
        !!+schoolCityName.value && !!+schoolCountryName.value;
}

showSchools.onclick = function () {
    removeTable();
    getSchools()
        .then(function (response) {
            createSchoolsTable(response);
        })
        .catch(function (response) {
            showAlertModal(errorsObj[response.message]);
        });
}

schoolFormClose.onclick = function () {
    var table = document.getElementById('infotable');
    schoolModal.classList.remove('show');
    schoolForm.setAttribute('action', mainUrl + '/school');
    if (table.dataset.oldid) delete table.dataset.oldid;
}

schoolSave.onclick = function () {
    var table = document.getElementById('infotable');
    var schoolData = 'schoolname=' + schoolName.value + '&cityname=' + schoolCityName.value;
    if (table.dataset.oldid) {
        schoolData = schoolData + '&oldcityname=' + table.dataset.oldid;
    }
    if (!validateShoolForm()) {
        showAlertModal(errorsObj.VALIDATION_ERROR);
        return;
    }
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
