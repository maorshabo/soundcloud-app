(function() {
  'use strict';

  angular
    .module('soundcloudApp.recentSearches')
    .service('RecentSearches', RecentSearches);

  /** @ngInject */
  function RecentSearches(localStorageService) {
    // holds the searches history max limit
    this.searchesLimit = 5;
    this.recentSearches = [];

    this.loadRecentSearches = function() {
      if (this.recentSearches.length == 0)
        this.recentSearches = angular.fromJson(localStorageService.get('recentSearches')) || [];
      return this.recentSearches;
    }.bind(this);

    this.saveRecentSearches = function(searchesArray) {
      localStorageService.set('recentSearches',angular.toJson(searchesArray));
    };

    this.addSearch = function(search) {
      if (typeof search == 'string' && search.length > 0 && this.recentSearches[0] !== search) {
        this.recentSearches.unshift(search);
        // if the array have reched to the limit, remove the last one
        if (this.recentSearches.length > this.searchesLimit) {
          this.recentSearches.splice(this.searchesLimit, 1);
        }
        this.saveRecentSearches(this.recentSearches);
      }
      return this.loadRecentSearches();
    }.bind(this);
  }
})();
