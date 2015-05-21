(function(){

$(document).ready(function(){
    usersWant = $.getJSON("http://bgg-users-want.azurewebsites.net/api/game/71906");
    console.log(usersWant);
});

})();