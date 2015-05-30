$(document).ready(function() {
    // Initial visibility
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
    
    var gameID = $('#gameId').val(); //'71906';
    collectionsAvailable = {};
    
    btnGetUsersWanting.html('Searching BGG for users that want your game…');
    var usersWantUrl = 'http://bgg-users-want.azurewebsites.net/api/game/' + gameID;
    $.getJSON(usersWantUrl, getUsersWanting);
}

function asc_sort(a, b) {
    return ($(b).text()) < ($(a).text()) ? 1 : -1;
}

function displayGames(gameName, game) {
    var userUrl = 'http://boardgamegeek.com/user/';
    var gameUrl = 'http://boardgamegeek.com/boardgame/';
    
    var userAnchorsString = 
        $.map(game.owners, 
            function(item, index) {
                return $('<a>', {href:userUrl + item})
                .append(item)
                .prop('outerHTML')
            }
        )
        .sort()
        .join(', ');
    
    var gameAnchor = $('<a>', {href:gameUrl + game.id})
        .append(gameName)
        .prop('outerHTML');
    
    var spanUserList = $('<span>', {'class':'user-list'}).append(userAnchorsString);
    var liGame = $('<li>').append(gameAnchor).append(spanUserList);
    $('#olGamesAvailable').append(liGame);
}

function getUsersWanting(data) {
    var gamesAvailable = {};
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
        
        // loop through users
        $.each(collectionsAvailable, function(userName, collection) {
            // loop through games user has for trade
            $.each(collection.items.item, function(index, item) {
                var gameName = item.name[0]['_'];
                var gameID = item['$'].objectid;
            
                if(!gamesAvailable.hasOwnProperty(gameName)) {
                    gamesAvailable[gameName] = {};
                    gamesAvailable[gameName].id = gameID;
                    gamesAvailable[gameName].owners = [];
                }
                
                gamesAvailable[gameName].owners.push(userName);
            });
        });
        
        $.each(gamesAvailable, displayGames);
        $('#olGamesAvailable li').sort(asc_sort).appendTo('#olGamesAvailable');
    });
}

function storeGameCollectionFactory(userName) {
    return function(data, textStatus, jqXHR) {
        if (data.hasOwnProperty('message')) {
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