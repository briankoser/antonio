$(document).ready(function() {
    $('#artUsersUnavailable').hide();
    $('#artGamesAvailable').hide();
    
    // Events
    $('#getUsersWanting').click(antonio);
});


// Methods
function antonio() {
    $('#artGamesAvailable').show();
    
    var btnGetUsersWanting = $('#getUsersWanting');
    btnGetUsersWantingText = btnGetUsersWanting.html();
    btnGetUsersWanting.prop('disabled', true).html('Processing…');
    
    /*var*/ gameID = $('#gameId').val(); //'71906';
    /*var*/ gamesAvailable = {};
    /*var*/ collectionsAvailable = {};
    /*var*/ usersDataUnavailable = [];
    
    btnGetUsersWanting.html('Searching BGG for users that want your game…');
    var usersWantUrl = 'http://bgg-users-want.azurewebsites.net/api/game/' + gameID;
    $.getJSON(usersWantUrl, getUsersWanting);
}

function getUsersWanting(data) {
    var btnGetUsersWanting = $('#getUsersWanting');
    btnGetUsersWanting.html('Checking what games they’re trading…');
    
    // loop through users wanting the game
    var gameCollectionRetrievers = [];
    $.each(data.UsersWant, function(index, user) {
        var collectionUrl = 'http://bgg-api.herokuapp.com/api/v1/collection?username=' + user.Name + '&trade=1';
        gameCollectionRetrievers.push(
            $.getJSON(collectionUrl, storeGameCollectionFactory(user.Name))
        );
    });
    
    $.when.apply($, gameCollectionRetrievers).done(function() {
        $('#getUsersWanting').prop('disabled', false).html(btnGetUsersWantingText);
        
        // loop through games user has for trade
        console.log(JSON.stringify(collectionsAvailable));
        console.log('\n');
        
        $.each(collectionsAvailable, function(userName, collection) {
            $.each(collection.items.item, function(index, item) {
                var game = item.name[0]['_'];
            
                if(!gamesAvailable.hasOwnProperty(game)) {
                    gamesAvailable[game] = [];
                }
                
                gamesAvailable[game].push(userName);
            });
        });
        
        $.each(gamesAvailable, displayGames);
        $('#olGamesAvailable li').sort(asc_sort).appendTo('#olGamesAvailable');
    });
}

function displayGames(game, userList) {
    var userUrl = 'http://boardgamegeek.com/user/';
    var gameUrl = 'http://boardgamegeek.com/boardgame/';
    
    var userAnchorsString = 
        $.map(userList, 
            function(item, index) {
                return $('<a>', {href:userUrl + item})
                .append(item)
                .prop('outerHTML')
            }
        )
        .sort()
        .join(', ');
    
    var spanUserList = $('<span>', {'class':'user-list'}).append(userAnchorsString);
    var liGame = $('<li>').append(game).append(spanUserList);
    $('#olGamesAvailable').append(liGame);
}

function storeGameCollectionFactory(userName) {
    return function(data, textStatus, jqXHR) {
        if (data.hasOwnProperty('message')) {
            usersDataUnavailable.push(userName);
            
            $('#users-unavailable').append(
                $('<li>').append(userName)
            );
            
            $('#artUsersUnavailable').show();
        }
        else {
            collectionsAvailable[userName] = data;
        }
    };
}

function asc_sort(a, b) {
    return ($(b).text()) < ($(a).text()) ? 1 : -1;
}