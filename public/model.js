"use strict";

var Model = function(token) {
    var that = this;
    var _token = token;
    var _taggedSongs = [];
    var observers = [];
    var loading = false;
    var states = {'playlists':0, 'songlist':1, 'details':2};
    var viewState = 'playlists';
    var viewTitle = 'Playlists';
    var lastPlaylist = '';

    this.fetchPlaylists = function(url, callback) {
        console.log('Fetching playlists -- ' + url);
        $.ajax(url, {
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + _token
            },
            success: function(r) {
                console.log('Got playlists', r);
                callback(r.items);
            },
            error: function(r) {
                callback(null);
            }
        });
    }

    this.fetchSongList = function(ids, callback) {
        $.ajax("https://api.spotify.com/v1/tracks/?ids="+ids.join(), {
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + _token
            },
            success: function(r) {
                callback(r);
            },
            error: function(r) {
                callback(null);
            }
        });
    }

    this.fetchSongs = function(url, callback) {
        console.log('Fetching songs -- ' + url);
        $.ajax(url, {
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + _token
            },
            success: function(r) {
                callback(r);
            },
            error: function(r) {
                callback(null);
            }
        });
    }

    this.setRating = function(id, rating) {
        $.post("http://localhost:3000/ratings",
                {'id':id, 'rating':rating}, null, 'json');
    }

    this.getRating = function(id, callback) {
        console.log('Fetching rating for ' + id);
        $.ajax("http://localhost:3000/ratings/" + id, {
            dataType: 'json',
            success: function(r) {
                callback(r.rating);
            },
            error: function(r) {
                callback(0);
            }
        });
    }

    this.getRatedSongs = function(callback) {
        $.ajax("http://localhost:3000/ratings", {
            dataType: 'json',
            success: function(r) {
                callback(r);
            },
            error: function(r) {
                callback(null);
            }
        });
    }

    this.setTags = function(id, tagList) {
        $.post("http://localhost:3000/tags",
                {'id':id, 'tags':JSON.stringify(tagList)}, null, 'json');
    }

    this.getTags = function(id, callback) {
        console.log('Fetching tags for ' + id);
        $.ajax("http://localhost:3000/tags/" + id, {
            dataType: 'json',
            success: function(r) {
                callback(JSON.parse(r.tags));
            },
            error: function(r) {
                callback(null);
            }
        });
    }

    this.getTaggedSongs = function(callback) {
        $.ajax("http://localhost:3000/tags", {
            dataType: 'json',
            success: function(r) {
                callback(r);
            },
            error: function(r) {
                callback(null);
            }
        });
    } 

    this.currentView = function(viewDetails) {
        if (viewDetails) {
            viewState = viewDetails[0];
            viewTitle = viewDetails[1];
            if (viewState === 'songlist') {
                lastPlaylist = viewTitle;
            }
            that.notifyObservers();
        } else {
            return {'state':viewState, 'mult':states[viewState], 'title':viewTitle};
        }
    }

    this.getLastPlaylist = function() {
        return lastPlaylist;
    }

    this.runCallback = function() {
        return true;
    }

    this.addObserver = function(observer) {
        console.log("Adding observer " + observer);
        observers.push(observer);
    }

    this.notifyObservers = function() {
        console.log("Notifying observers");
        _.forEach(observers, function(observer) {
            observer.notify();
        });
    }
}

