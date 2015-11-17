(function() {
  'use strict';

  angular
    .module('soundcloudApp.recentSearches')
    .directive('recentSearches', recentSearches);

  /** @ngInject */
  function recentSearches(RecentSearches) {
    var directive = {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/recentSearches/recentSearches.html',
      controller: function($scope) {
        var vm = this;
        // hold the view's recent searches
        this.recentSearches = RecentSearches.loadRecentSearches();

        $scope.$watch(function() {
          return RecentSearches.recentSearches
        },function(newRecentSearchList) {
          vm.recentSearches = newRecentSearchList;
        })
      },
      controllerAs: 'vm'
    };

    return directive;
  }

})();
