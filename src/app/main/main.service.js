(function() {
  'use strict';

  angular
    .module('soundcloudApp')
    .service('AppService', AppService);

  /** @ngInject */
  function AppService(RecentSearches) {
    this.selectedSearchResult = {};
    this.recentSearches = RecentSearches.loadRecentSearches();

    this.addRecentSearch = function(search) {
      this.recentSearches = RecentSearches.addSearch(search);
    }
  }
})();
