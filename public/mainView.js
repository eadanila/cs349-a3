"use strict";

var MainView = function(model) {
    var that = this;
    var div = $("#mainview");
    model.addObserver(this);

    this.details = function(song) {
        console.log(song);
    }

    this.songs = function(item, call) {
        var span = div.find("#songlist");
        var load = $("template#load-spinner").html();
        load = $(load);
        span.html(load);
        var ul = $("template#playlistsTemplate").html();
        ul = $(ul);
        var nav = $("template#listNavTemplate").html();
        if (item === null) {
            ul.html("<center><li>No results</li></center>");
            span.html(ul);
            return;
        }
        
        var callback = function(items) {
            console.log(items);
            if (call == 0) {
                items = items.items;
            } else {
                items = items.tracks;
            }
            _.forEach(items, function(song) {
                var template = $("template#itemTemplate");
                var elem = $(template.html());
                
                var songId;
                if (call === 0) {
                    songId = song.track.id;
                } else {
                    songId = song.id;
                }

                var images;
                if (call === 0) {
                    images = song.track.album.images;
                } else {
                    images = song.album.images;
                }
                if (images.length > 0) {
                    var img = document.createElement('img');
                    img.src=images[images.length-1].url; //get the smallest picture
                } else {
                    var img = document.createElement('i');
                    img.classList.add('material-icons');
                    img.classList.add('placeholder');
                    $(img).html('library_music');
                }

                var options = $("template#options").html();
                options=$(options);
                options.hide();

                var rating = options.find("#rating");
                _.forEach(rating.children(), function(child) {
                    var count = 1;
                    $(child).click(function() {
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
                        model.setRating(songId, count);
                    });
                });

                model.getRating(songId, function(numStars) {
                    _.forEach(_.range(numStars), function(num) {
                        $(rating.children()[num]).html("<i class='material-icons'>star</i>");
                    });
                });

                var tags = options.find("#tags");
                var addTags = function(storedTags) {
                    if (storedTags && storedTags.length > 0) {
                        console.log(storedTags);
                        tags.show();
                        var tagsList = $("template#tagsListTemplate").html();
                        tagsList = $(tagsList);
                        _.forEach(storedTags, function(tag) {
                            var tagItem = $("template#tagTemplate").html();
                            tagItem = $(tagItem);
                            tagItem.find("#tagName").html(tag);
                            tagItem.click(function() {
                                model.getTags(song.track.id, function(tags) {
                                    tags = tags.filter(function(someTag) {
                                        return tag != someTag;
                                    });
                                    model.setTags(song.track.id, tags);
                                    addTags(tags);
                                });
                            });
                            tagsList.append(tagItem);
                        });
                        if (tags.find("#tagsList").length > 0) {
                            tags.find("#tagsList").remove();
                        }
                        tags.append(tagsList);
                    } else {
                        tags.hide();
                    }
                }
                model.getTags(songId, addTags);

                var form = options.find("#tagsForm");
                var tagsEditor = options.find("#tagsEditor");
                tagsEditor.hide();
                options.find("#editTags").click(function() {
                    tagsEditor.toggle('fast');
                    form.find("#input").focus();
                });

                form.find("#input").keydown(function(e) {
                    if (e.keyCode === 13) {
                        var input = form.find("#input")[0].value;
                        form.find("#input")[0].value = "";
                        model.getTags(song.track.id, function(tags) {
                            if (tags) {
                                tags = tags.concat(input.split(" "));
                            } else {
                                tags = input.split(" ");
                            }
                            if (tags.length > 0) {
                                model.setTags(song.track.id, tags);
                            }
                            addTags(tags);
                        });
                    }
                });

                form.find("#done").click(function() {
                    var input = form.find("#input")[0].value;
                    form.find("#input")[0].value = "";
                    model.getTags(song.track.id, function(tags) {
                        if (tags) {
                            tags = tags.concat(input.split(" "));
                        } else {
                            tags = input.split(" ");
                        }
                        if (tags.length > 0) {
                            model.setTags(song.track.id, tags);
                        }
                        addTags(tags);
                    });
                });
                form.find("#clear").click(function() {
                    form.find("#input")[0].value = "";
                    tagsEditor.toggle('fast');
                });
                
                var songName;
                if (call === 0) {
                    songName = song.track.name;
                } else {
                    songName = song.name;
                }
                
                options.find("#showDetails").hide();
                options.find("#showDetails").click(function() {
                    model.currentView(['details', songName]);
                });

                elem.append(options);
                elem.find("#albumArt").html(img);
                elem.find("#content").html(songName);
                elem.find("#listnav").html($(nav).html("expand_more"));
                elem.find("#listnav").click(function() {
                    $(options).toggle('fast');
                });
                ul.append(elem);
            });
            ul[0].children[0].classList.add('first');
            ul[0].children[ul[0].children.length-1].classList.add('last');
            if (items.next) {
                model.fetchSongs(items.next, callback);
            }
        }
        if (call === 0) {
            model.fetchSongs(item.href+"/tracks?limit=100", callback);
        } else {
            model.fetchSongList(item, callback);
        }
        span.html(ul);
    }

    this.playlists = function() {
        console.log("MainView => playlists");
        var url = "https://api.spotify.com/v1/me/playlists?limit=50";
        var span = div.find("#playlists"); 
        var load = $("template#load-spinner").html();
        load = $(load);
        span.html(load);
        var ul = $("template#playlistsTemplate").html();
        ul = $(ul);
        var nav = $("template#listNavTemplate").html();
        var callback = function(items) {
            _.forEach(items, function(item) { 
                var template = $("template#itemTemplate");
                var elem = $(template.html());
                // fallback in case the album art can't be found for any reason
                if (item.images.length > 0) {
                    var img = document.createElement('img');
                    img.src=item.images[0].url;
                } else {
                    var img = document.createElement('i');
                    img.classList.add('material-icons');
                    img.classList.add('placeholder');
                    $(img).html('library_music');
                }
                elem.click(function() {
                    that.songs(item, 0);
                    model.currentView(['songlist', item.name]);
                });
                elem.find("#albumArt").html(img);
                elem.find("#content").html(item.name);
                elem.find("#listnav").html(nav);
                ul.append(elem);
            });
            ul[0].children[0].classList.add('first');
            ul[0].children[ul[0].children.length-1].classList.add('last');
            if (items.next) {
                model.fetchPlaylists(next, callback);
            }
        }
        model.fetchPlaylists(url, callback);
        span.html(ul);
    }

    this.slideView = function() {
        var m = model.currentView()['mult'];
        div.find('#playlists').animate({left:-100*m + '%'});
        div.find('#songlist').animate({left:-100*m+100 + '%'});
        div.find('#details').animate({left:-100*m+200 + '%'});
        div.scrollTop(0);

    }

    this.notify = function() {
        that.slideView();
    }
}

