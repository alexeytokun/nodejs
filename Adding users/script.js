var wrapper = document.getElementById('wrapper');
var saveButton = document.getElementById('save');
var userForm = document.getElementById('userform');
var username = document.getElementById('username');
var surname = document.getElementById('surname');
var age = document.getElementById('age');
var showAll = document.getElementById('showall');
var newUserButton = document.getElementById('createuser');
var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];
var mainUrl = 'http://127.0.0.1:8000';

saveButton.onclick = function (event) {
    var user = 'username=' + username.value + '&surname=' + surname.value + '&age=' + age.value;
    saveUser(user);
    modal.style.display = "none";
}

showAll.onclick = function () {
    var container = document.getElementById('userstable');
    if (container) {
        container.parentNode.removeChild(container);
    } else {
        updateTable();
    }

}

newUserButton.onclick = function () {
    modal.style.display = "block";
}

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function saveUser (user) {

    var url = userForm.getAttribute('action');
    var XHR = new XMLHttpRequest();
    XHR.open("POST", url);
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    XHR.send(user);
    XHR.onload = XHR.onerror = function () {
        if (this.status == 200) {
            var response = XHR.response;
            if (document.getElementById('userstable')) {
                updateTable();
                //alert('User data updated');
            } else {
                //alert('Created new user with id: ' + response);
            }
        } else if (this.status == 406) {
            alert('Validation error');
        } else {
            alert("error " + this.status);
            console.log("error " + this.status);
        }
    }

    userForm.setAttribute('action', mainUrl + '/user');
}

function deleteUser (id) {

    var url = mainUrl + '/user/' + id;
    var XHR = new XMLHttpRequest();
    XHR.open("DELETE", url);
    XHR.send();

    XHR.onload = XHR.onerror = function () {
        if (this.status == 200) {
            var response = XHR.response;
            alert(response);
            updateTable();
        } else {
            alert("error " + this.status);
        }
    }
}

function editUser (id) {

    getUserInfo(id)
        .then(
            function (response) {
                username.value = response.username;
                surname.value = response.surname;
                age.value = response.age;
                modal.style.display = "block";
            }
        )

    userForm.setAttribute('action', mainUrl + '/user/' + id);
}

function showUser (id) {
    getUserInfo(id).then(
        function (response) {
            showUserInfo(response);
        }
    )
}

function getUserInfo(id) {

    return new Promise(
        function (resolve, reject) {
            var url = mainUrl + '/user/' + id;
            var XHR = new XMLHttpRequest();
            XHR.open("GET", url);
            XHR.send();

            XHR.onload = XHR.onerror = function () {
                if (this.status == 200) {
                    resolve(JSON.parse(XHR.response));
                } else {
                    console.log("error " + this.status);
                    reject("error " + this.status);
                }
            }
        }
    )
}

function createTable(usersObj) {
    var container = document.createElement('div');
    if (document.getElementById('userstable')) {
        var elem = document.getElementById('userstable');
        elem.parentNode.removeChild(elem);
    }
    container.setAttribute('id', 'userstable');
    var table = document.createElement('table');
    usersObj.forEach(element => {
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

        if (target.className == 'del') {
            deleteUser(targetId);
        }

        if (target.className == 'edit') {
            editUser(targetId);
        }

        if (target.className == 'info') {
            showUser(targetId);
        }
    }

    wrapper.insertBefore(container, showAll);
}

function updateTable() {
    var url = mainUrl + '/users';
    var XHR = new XMLHttpRequest();
    XHR.open("GET", url);
    XHR.send();
    XHR.onload = XHR.onerror = function () {
        if (this.status == 200) {
            var response = JSON.parse(XHR.response);
            createTable(response);
        } else {
            console.log("error " + this.status);
        }
    }
}

function showUserInfo(user) {

    var modalDiv = document.createElement('div');
    modalDiv.classList.add('modal');

    var container = document.createElement('div');
    container.setAttribute('id', 'userinfo');
    container.classList.add('modal-content');

    var span = document.createElement('span');
    span.innerHTML = '&times;';
    container.appendChild(span).classList.add('close');

    var table = document.createElement('table');
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>Name: ' + user.username + '</td>' +
        '<td>Surname: ' + user.surname + '</td>' +
        '<td>Age: ' + user.age + '</td>';
    tr.setAttribute('id', user.id);
    table.appendChild(tr);

    container.appendChild(table);
    modalDiv.appendChild(container);
    wrapper.appendChild(modalDiv);
    modalDiv.style.display = 'block';
    span.onclick = function () {
        wrapper.removeChild(modalDiv);
    }
}