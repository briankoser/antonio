$(document).ready(function() {
    // Initial visibility
    $('#artUsersUnavailable').hide();
    $('#artGamesAvailable').hide();
    
    // Events
    $('#btnGetUsersWanting').click(antonio);
});


// Methods
/* antonio: main processing, kicks off AJAX to search for games available for trade */
function antonio() {
    // Set visibility, disable controls
    $('#artGamesAvailable').show();
    var btnGetUsersWanting = $('#btnGetUsersWanting');
    btnGetUsersWanting.prop('disabled', true);
    
    // Global variables
    collectionsAvailable = {};
    readyStatusMessage = btnGetUsersWanting.html();
    
    // Display game name
    var gameID = $('#txtGameID').val();
    var gameUrl = 'http://bgg-api.herokuapp.com/api/v1/thing?id=' + gameID;
    $.getJSON(gameUrl, getGameName);
    
    // AJAX for determining which users want the input game
    setStatusMessage('Searching BGG for users that want your game…');
    var usersWantUrl = 'http://bgg-users-want.azurewebsites.net/api/game/' + gameID;
    $.getJSON(usersWantUrl, getUsersWanting);
}

/* asc_sort: sorts two HTML elements alphabetically by their text */
function asc_sort(a, b) {
    return ($(b).text().toLowerCase()) < ($(a).text().toLowerCase()) ? 1 : -1;
}

/* displayGame: adds list item of game and users to page */
function displayGame(gameName, game) {
    var gameUrl = 'http://boardgamegeek.com/boardgame/';
    var userUrl = 'http://boardgamegeek.com/user/';
    var gameClass = 'game-' + game.id;
    var liGame;
    
    // If game doesn't exist in list, create it
    if($('.' + gameClass).length)
    {
        liGame = $('.' + gameClass);
    }
    else
    {
        // Creates hyperlink for game
        var gameAnchorString = $('<a>', {href:gameUrl + game.id})
            .append(gameName)
            .prop('outerHTML');
        
        // Creates list item for game
        liGame = $('<li>', {class:gameClass}).append(gameAnchorString);
    }
    
    // Creates <span> of comma-separated hyperlinks for each user
    var userAnchorsString = 
        $.map(
            getUnique(game.owners)
            .filter(function(item) {
                return $('.' + gameClass + ' .user-list a').length == 0 || 
                    $('.' + gameClass + ' .user-list a:not(:contains("' + item + '"))').length > 0;
            }),
            function(item, index) {
                return $('<a>', {href:userUrl + item})
                .append(item)
                .prop('outerHTML')
            }
        )
        .sort()
        .join(', ');
    var spanUserList = $('<span>', {'class':'user-list'}).append(userAnchorsString);
    liGame.append(spanUserList);
    
    $('#olGamesAvailable').append(liGame);
}

/* getGameName: gets the name for a game, given an id */
function getGameName(data) {
    $('#hYourGame').html('Your game (' + data.items.item[0].name[0]['$'].value + ')');
}

/* getUsersWanting: for all users that want a game, get their collections for trade and display them */
function getUsersWanting(data) {
    setStatusMessage('Checking what games they’re trading…');
    
    var gamesAvailable = {};
    
    // Loop through users wanting the game
    var collectionRetrievers = [];
    $.each(data.UsersWant, function(index, user) {
        var collectionUrl = 'http://bgg-api.herokuapp.com/api/v1/collection?username=' + user.Name + '&trade=1';
        // Create array of AJAX calls that will get users’ collections
        collectionRetrievers.push(
            $.getJSON(collectionUrl, storeCollectionFactory(user.Name))
        );
    });
    
    // Get users’ collections
    $.when.apply($, collectionRetrievers).always(function() {
        // Loop through collections
        $.each(collectionsAvailable, function(userName, collection) {
            // loop through games user has for trade
            if(collection.items.hasOwnProperty('item')) {
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
            }
        });
        
        // Display games available for trade
        $.each(gamesAvailable, displayGame);
        $('#olGamesAvailable li').sort(asc_sort).appendTo('#olGamesAvailable');
        
        // Set form back to “ready” status
        $('#btnGetUsersWanting').prop('disabled', false);
        setStatusMessage(readyStatusMessage);
    });
}

/* getUnique: gets only unique items from array */
function getUnique(array) {
    return $.grep(array, function(item, index) {
        return index === $.inArray(item, array);
    });
}

/* setStatusMessage: display the status of the app to the user */
function setStatusMessage(message) {
    $('#btnGetUsersWanting').html(message);
}

/* storeCollectionFactory: creates function to populate array of game collections */
function storeCollectionFactory(userName) {
    return function(data, textStatus, jqXHR) {
        if (data.hasOwnProperty('message')) {
            $('#ulUsersUnavailable').append(
                $('<li>').append(userName)
            );
            
            $('#artUsersUnavailable').show();
        }
        else {
            collectionsAvailable[userName] = data;
        }
    };
}