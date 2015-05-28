$(document).ready(function() {
    $('#artUsersUnavailable').hide();
    $('#artGamesAvailable').hide();
    
    // Events
    $('#getUsersWanting').click(function() {
        $('#artGamesAvailable').show();
        
        var btnGetUsersWanting = $('#getUsersWanting');
        var btnGetUsersWantingText = btnGetUsersWanting.html();
        btnGetUsersWanting.prop('disabled', true).html('Processing…');
        
        var gameID = $('#gameId').val(); //'71906';
        btnGetUsersWanting.html('Searching BGG for users that want your game…');
        $.getJSON('http://bgg-users-want.azurewebsites.net/api/game/' + gameID, function(data) {
            /*var*/ gamesAvailable = {};
            /*var*/ usersDataUnavailable = [];
            
            // loop through users wanting the game
            $.each(data.UsersWant, function(index, item) {
                var userName = item.Name;
                btnGetUsersWanting.html('Checking what games ' + userName + ' is trading…');
                
                if (userName === 'klurejr' || userName === 'Base the Bass' || userName === 'tavlas') {
                    var url = 'https://bgg-api.herokuapp.com/api/v1/collection?username=' + userName + '&trade=1';
                    
                    $.getJSON(url, function(data) {
                        if (data.hasOwnProperty('message')) {
                            usersDataUnavailable.push(userName);
                            
                            $('#users-unavailable').append(
                                $('<li>').append(userName)
                            );
                            
                            $('#artUsersUnavailable').show();
                        }
                        else {
                            // loop through games user has for trade
                            $.each(data.items.item, function(index, item) {
                                var game = item.name[0]['_'];
                                
                                if(!gamesAvailable.hasOwnProperty(game)) {
                                    gamesAvailable[game] = [];
                                }
                                
                                gamesAvailable[game].push(userName);
                            });
                        }
                        
                        
                    });
                }
                    
                var userUrl = 'http://boardgamegeek.com/user/';
                var gameUrl = 'http://boardgamegeek.com/boardgame/';
                $.each(gamesAvailable, function(game, userList) {
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
                });
                
                btnGetUsersWanting.prop('disabled', false).html(btnGetUsersWantingText);
            });
        });
    });

    // Methods
});