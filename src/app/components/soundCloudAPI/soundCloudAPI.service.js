(function(SC) {
  'use strict';

  angular
    .module('soundcloudApp')
    .service('SoundCloudAPI', SoundCloudAPI);

  /** @ngInject */
  function SoundCloudAPI($http) {
    var self = this;
    var clientId = 'd652006c469530a4a7d6184b18e16c81';
    SC.initialize({
      client_id: clientId
    });

    // holds the next url in the search results
    var nextUrl = '';
    // determine if we are on the last page of results
    this.isLastPage = true;
    // search function that gets query and limit and returns a promise
    this.search = function(query,limit) {
      return SC.get('/tracks',{
        q: query,
        limit: limit,
        linked_partitioning: 1
      }).then(getSearchResultsSuccess);
    };

    this.next = function() {
      if (nextUrl) {
        return $http.get(nextUrl).then(getNextResultsSuccess)
      }
    };

    var getSearchResultsSuccess = function(results) {
      nextUrl = results.next_href;
      if (nextUrl) {
        this.isLastPage = false
      }
      else {
        this.isLastPage = Object.isDnextUrl
      }
      return results.collection;
    }.bind(this);

    var getNextResultsSuccess = function(httpResponse) {
      return getSearchResultsSuccess(httpResponse.data);
    };

    this.getEmbed = function(track_url) {
      if (track_url)
        return SC.oEmbed(track_url, { auto_play: true });
    }
  }
})(SC);
