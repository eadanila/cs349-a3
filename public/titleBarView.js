"use strict";

var TitleBarView = function(model, mainView) {
    var that = this;
    var div = $("#titlebar");
    model.addObserver(this);

    this.displayResults = function(results, query) {
        var songs = results.map(function(result) { return result.id });
        if (songs.length > 0) {
            mainView.songs(songs, 1);
            model.currentView(['songlist','Search: ' + query]);
        } else {
            console.log("No results");
            mainView.songs(null, 1);
            model.currentView(['songlist', 'Search: No Results']);
        }
    }

    this.filterRatings = function(songlist, minrating, callback) {
        var ids = [];
        _.forEach(songlist, function(song) {
            ids.push(song.id);
        });
        console.log("--- ids ---");
        console.log(ids);
        if (minrating > 0) {
            model.getRatedSongs(function(ratings) {
                console.log(ratings);
                var filtered = ratings.filter(function (rating) {
                    return (rating.rating >= minrating && $.inArray(rating.id, ids) !== -1);
                });
                callback(filtered);
            });
        } else {
            callback(songlist);
        }
    }

    this.filterAndDisplay = function(query, matching, minrating) {
        query = query.split(' ');
        model.getTaggedSongs(function(tags) {
            var filtered = tags.filter(function(tag) {
                var parsed = JSON.parse(tag.tags);
                if (matching === 0) {
                   var ormap = false;
                   _.forEach(query, function(queryItem) {
                        if ($.inArray(queryItem, parsed) !== -1) { 
                            ormap = true;
                        }
                   });
                   return ormap;
                } else {
                    var andmap = true;
                    _.forEach(query, function(queryItem) {
                        if ($.inArray(queryItem, parsed) === -1) {
                            andmap = false;
                        }
                    });
                    return andmap;
                }
            });
            that.filterRatings(filtered, minrating, function(rated) {
                that.displayResults(rated, query.join(" "));
            });
        });
    }

    this.setNav = function() {
        var viewDetails = model.currentView();
        var nav = $(div.children()[0]);
        if (viewDetails['state'] === 'playlists') {
            nav.unbind();
            nav.on('click', function() {}); //done this way as an exercise
            nav[0].style.color = "#4CA050";
        } else if (viewDetails['state'] === 'songlist') {
            nav.unbind();
            nav.click(function()  {
                model.currentView(['playlists','Playlists']);
            });
            nav[0].style.color = "white";
        } else if (viewDetails['state'] === 'details') {
            nav.unbind();
            nav.click(function() {
                model.currentView(['songlist', model.getLastPlaylist()]);
            });
            nav[0].style.color = "white";
        }
    }

    this.setTitle = function() {
        var title = model.currentView()['title']
        var t = $(div.children()[1]);
        t.html(title);
    }
    
    that.setUp = function() {
        var count = 0;
        var checkedRadio = 0;
       
        that.setTitle();

        div.find("#searchMenu").hide();
        div.find("#searchMenu>#searchResults").hide();
        div.find("#search").click(function(){
            div.find("#searchMenu").toggle('fast');
            console.log(div.find("#searchMenu>#main"));
            div.find("#searchMenu>#main").focus();
        });
        div.find("#searchMenu>#done").click(function() {
            console.log('click');
            div.find("#searchMenu").hide('fast');
            var search = div.find("#searchMenu>#main")[0].value;
            that.filterAndDisplay(search, checkedRadio, count);
        });
        div.find("#searchMenu>#clear").click(function() {
            div.find("#searchMenu>input")[0].value = "";
            div.find("#searchMenu").hide('fast');
        });
        div.find("#searchMenu>#main").keydown(function(e){
            if (e.keyCode === 13) {
                console.log('keyEvent');
                div.find("#searchMenu").hide('fast');
                var search = div.find("#searchMenu>#main")[0].value;
                that.filterAndDisplay(search, checkedRadio, count);
            }
        });
        
        var rating = div.find("#searchMenu>#minrating>#stars");
        _.forEach(rating.children(), function(child) {
            $(child).click(function() {
                count = 1;
                var style = 'star';
                if ($(child)[0].id === 'star1') {
                    _.forEach(rating.children(), function(star) {
                        if ($(star)[0].id === 'star1' && $($(star).html()).html() === 'star') {
                            style = 'star_border';
                            count = 0;
                        } else if ($($(star).html()).html() === 'star') {
                            style = 'star';
                            count = 1;
                        }
                    });
                }
                _.forEach(rating.children(), function(star) {
                    $(star).html("<i class='material-icons'>"+style+"</i>");
                    if ($(star)[0].id === $(child)[0].id) {
                        style = 'star_border';
                    }
                    if (style === 'star') {
                        count += 1;
                    }
                });
            });
        });

        var matching = div.find("#searchMenu>#matching");
        var radio1 = div.find("#searchMenu>#matching>#radio1");
        var radio2 = div.find("#searchMenu>#matching>#radio2");
        _.forEach(matching.children(), function(child) {
            $(child).click(function() {
                var checked = "<i class='material-icons'>radio_button_checked</i>";
                var unchecked = "<i class='material-icons'>radio_button_unchecked</i>";
                if ($(child)[0].id === 'radio1') {
                    checkedRadio = 0;
                    radio1.find("i").html(checked);
                    radio2.find("i").html(unchecked);
                } else {
                    checkedRadio = 1;
                    radio1.find("i").html(unchecked);
                    radio2.find("i").html(checked);
                }
            });
        });
    }

    this.notify = function() {
        that.setNav();
        that.setTitle();
        div.find("#searchMenu").hide("fast");
    }   
}

