(function() {
  'use strict';

  angular
    .module('soundcloudApp.searchContainer')
    .directive('search', search);

  /** @ngInject */
  function search(SoundCloudAPI,AppService,$timeout,localStorageService) {
    var directive = {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/searchContainer/searchContainer.html',
      controller: function() {
        var vm = this;
        this.isLoading = false;
        // holds how much results per page
        this.resultsPerPage = 6;
        // hold current view mode state: (list,tiles)
        this.viewMode = localStorageService.get('viewMode') || 'list';
        // view model to hold the search query
        this.searchQuery = '';
        // holds the search results
        this.searchResults = [];
        // get results from the SoundCloudAPI service
        this.search = function() {
          this.isLoading = true;
          this.searchResults = [];
          SoundCloudAPI.search(this.searchQuery,this.resultsPerPage).then(vm.fetchResults);
          AppService.addRecentSearch(this.searchQuery);
        }.bind(this);

        // function to get the next bunch of data
        this.next = function() {
          if (!SoundCloudAPI.isLastPage) {
            this.isLoading = true;
            SoundCloudAPI.next().then(vm.fetchResults)
          }
        }.bind(this);

        // handle click on a result item
        this.selectResult = function(result) {
          AppService.selectedSearchResult = result;
        };

        this.fetchResults = function(results) {
          $timeout(function() {
            vm.searchResults = results;
            vm.isLoading = false;
          });
        };

        this.setViewMode = function(viewMode) {
          this.viewMode = viewMode;
          localStorageService.set('viewMode',viewMode);
        }.bind(this);
      },
      controllerAs: 'vm'
    };

    return directive;
  }

})();
