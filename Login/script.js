var mainUrl = 'http://127.0.0.1:8000';
var authHeader;
var idHeader;

var wrapper = document.getElementById('wrapper');
var saveButton = document.getElementById('save');
var newUserButton = document.getElementById('createuser');
var showSignIn = document.getElementById('showsignin');
var showAll = document.getElementById('showall');

var userForm = document.getElementById('userform');
var username = document.getElementById('username');
var surname = document.getElementById('surname');
var age = document.getElementById('age');
var pass = document.getElementById('pass');
var pass2 = document.getElementById('pass2');
var role = document.getElementById('role');

var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[1];
var span2 = document.getElementsByClassName("close")[0];

var signIn = document.getElementById('signin');
var signInButton = document.getElementById('si_save');
var si_username = document.getElementById('si_username');
var si_password = document.getElementById('si_password');

var signInSwitch = document.getElementById('si_switch');
var signUpSwitch = document.getElementById('switch');

saveButton.onclick = function (event) {

    if (!validate()) {
        alert('Validation error');
        return;
    }

    var user = 'username=' + username.value + '&surname=' + surname.value + '&age=' + age.value +
        '&pass=' + pass.value + '&role=' + role.value;
    saveUser(user);
    modal.classList.remove('show');
}

signInButton.onclick = function () {
    if (!validateSignIn()) {
        alert('Validation error');
        return;
    }
    var userData = 'username=' + si_username.value + '&pass=' + si_password.value;
    signInUser(userData);
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
    modal.classList.add('show');
    
}

showSignIn.onclick = function () {
    signIn.classList.toggle('show');
}

span.onclick = function () {
    modal.classList.remove('show');
    userForm.setAttribute('action', mainUrl + '/user');
    clearForm();
}

span2.onclick = function () {
    signIn.classList.remove('show');
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.classList.remove('show');
        userForm.setAttribute('action', mainUrl + '/user');
        clearForm();
    }

    if(event.target == signIn) {
        signIn.classList.remove('show');
    }
}

signInSwitch.onclick = signUpSwitch.onclick = function () {
    modal.classList.toggle('show');
    signIn.classList.toggle('show');
}

function saveUser(user) {

    var url = userForm.getAttribute('action');
    var XHR = new XMLHttpRequest();
    XHR.open("POST", url);
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    XHR.setRequestHeader('User-Role-Token', String(authHeader));
    XHR.setRequestHeader('User-Id-Token', String(idHeader));
    XHR.send(user);
    XHR.onload = XHR.onerror = function () {
        var response = JSON.parse(XHR.response);
        if (this.status == 200) {
            if (document.getElementById('userstable')) {
                updateTable();
                //alert('User data updated');
            }
            clearForm();
        } else if (this.status == 406) {
            alert(response.message);
        } else {
            alert("Error with status: " + this.status);
            console.log("Error with status: " + this.status);
        }
    }

    userForm.setAttribute('action', mainUrl + '/user');
}

function signInUser(user) {

    var url = mainUrl + '/signin';
    var XHR = new XMLHttpRequest();
    XHR.open("POST", url);
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    XHR.send(user);
    XHR.onload = XHR.onerror = function () {
        var response = JSON.parse(XHR.response);
        if (this.status == 200) {
            signIn.classList.remove('show');
            authHeader = response.roletoken;
            idHeader = response.idtoken;
            updateTable();

        } else if (this.status == 406) {
            alert(response.message);
        } else {
            alert("Error with status: " + this.status);
            console.log("Error with status: " + this.status);
        }
    }
}

function deleteUser(id) {

    var url = mainUrl + '/user/' + id;
    var XHR = new XMLHttpRequest();
    XHR.open("DELETE", url);
    XHR.setRequestHeader('User-Role-Token', String(authHeader));
    XHR.setRequestHeader('User-Id-Token', String(idHeader));
    XHR.send();

    XHR.onload = XHR.onerror = function () {
        var response = JSON.parse(XHR.response);
        if (this.status == 200) {
            alert(response.message);
            updateTable();
        } else if (this.status == 403) {
            alert(response.message);
        } else {
            alert("Error with status: " + this.status);
        }
    }
}

function editUser(id) {

    getUserInfo(id, false)
    .then(
        function (response) {
            username.value = response.username;
            surname.value = response.surname;
            age.value = response.age;
            modal.classList.add('show');
            userForm.setAttribute('action', mainUrl + '/user/' + id);
        }
    ).catch(function(response) {
        alert(response.message);
    })
}

function showUser(id) {
    getUserInfo(id, true)
    .then(
        function (response) {
            showUserInfo(response);
        }
    ).catch(function(response) {
        alert(response.message);
    })
}

function getUserInfo(id, flag) {

    return new Promise(
        function (resolve, reject) {
            var url = mainUrl + '/user/' + id;
            var XHR = new XMLHttpRequest();
            XHR.open("GET", url);
            XHR.setRequestHeader('User-Role-Token', String(authHeader));
            XHR.setRequestHeader('User-Id-Token', String(idHeader));
            if(flag) XHR.setRequestHeader('Info', 'info');
            XHR.send();

            XHR.onload = XHR.onerror = function () {
                var response = JSON.parse(XHR.response);
                if (this.status == 200) {
                    resolve(response);
                } else if (this.status == 403) {
                    reject(response);
                } else {
                    reject("Error with status: " + this.status);
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
    XHR.setRequestHeader('User-Role-Token', String(authHeader));
    XHR.setRequestHeader('User-Id-Token', String(idHeader));
    XHR.send();
    clearForm();
    XHR.onload = XHR.onerror = function () {
        var response = JSON.parse(XHR.response);
        if (this.status == 200) { 
            createTable(response);
        } else if (this.status == 403 ||this.status == 400) {
            alert(response.message);
        } else {
            console.log("Error with status: " + this.status);
        }
    }
}

function showUserInfo(user) {

    var modalDiv = document.createElement('div');
    modalDiv.classList.add('modal');

    var container = document.createElement('div');
    container.setAttribute('id', 'userinfo');
    container.classList.add('modal-content');
    container.classList.add('modal-info');

    var span = document.createElement('span');
    span.innerHTML = '&times;';
    container.appendChild(span).classList.add('close');

    var table = document.createElement('table');
    var tr = document.createElement('tr');
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
    span.onclick = function () {
        wrapper.removeChild(modalDiv);
    }
}

function validate() {
    return username.checkValidity() && surname.checkValidity() &&
        age.checkValidity() && pass.checkValidity() &&
        pass2.checkValidity() && (pass.value == pass2.value);
}

function validateSignIn() {
    return si_username.checkValidity() && si_password.checkValidity();
}

function clearForm() {
    username.value = surname.value = age.value = pass.value = pass2.value = '';
}