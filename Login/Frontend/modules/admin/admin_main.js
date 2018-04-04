function logOut() { // переписать для админа
    var elem;
    if (document.getElementById('infotable')) {
        elem = document.getElementById('infotable');
        elem.parentNode.removeChild(elem);
    }
}
