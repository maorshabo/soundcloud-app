(function() {
  'use strict';

  angular
    .module('soundcloudApp', ['ngRoute', 'soundcloudApp.searchContainer','soundcloudApp.imageContainer','soundcloudApp.recentSearches']);

})();

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
  SoundCloudAPI.$inject = ["$http"];
})(SC);

(function() {
  'use strict';

  angular
    .module('soundcloudApp.searchContainer', []);

})();

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
  search.$inject = ["SoundCloudAPI", "AppService", "$timeout", "localStorageService"];

})();

(function() {
  'use strict';

  angular
    .module('soundcloudApp.recentSearches', ['LocalStorageModule']);

})();

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
  RecentSearches.$inject = ["localStorageService"];
})();

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
  recentSearches.$inject = ["RecentSearches"];

})();

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
  AppService.$inject = ["RecentSearches"];
})();

(function() {
  'use strict';

  angular
    .module('soundcloudApp')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController() {
  }
})();

(function() {
  'use strict';

  angular
    .module('soundcloudApp.imageContainer', ['ngSanitize']);

})();

(function() {
  'use strict';

  angular
    .module('soundcloudApp.imageContainer')
    .directive('imageContainer', imageContainer);

  /** @ngInject */
  function imageContainer(AppService, SoundCloudAPI, $timeout) {
    var directive = {
      restrict: 'E',
      scope: {},
      bindToController: true,
      templateUrl: 'app/imageContainer/imageContainer.html',
      link: function(scope,elm,attrs,ctrl) {
        var embedElm = elm.find('.embed');
        var imageContainer = elm.find('.imageContainer');

        ctrl.getEmbed = function(track_url) {
          SoundCloudAPI.getEmbed(track_url).then(function (embedObject) {
            // $timeout because the Soundcloud api request is out of Angular scope
            $timeout(function() {
              embedElm.removeClass('fadeOut');
              ctrl.isPlaying = true;
              embedElm.html(embedObject.html).css('height',embedObject.height);
              imageContainer.addClass('fadeOut').css('z-index',-1);
            });
          });
        };

        ctrl.showImage = function() {
          embedElm.addClass('fadeOut');
          imageContainer.show().removeClass('fadeOut').css('z-index',1);
        }
      },
      controller: function($scope) {
        var self = this;
        // model to hold the current sound
        this.sound = {};
        // default state of isPlaying variable
        this.isPlaying = false;

        this.startPlay = function() {
          if (!this.isPlaying) {
            this.getEmbed(this.sound.permalink_url);
          }
        }.bind(this);

        // watch on AppService.selectedSearchResult to update the image and embed
        $scope.$watch(function() {
          return AppService.selectedSearchResult;
        },function(selectedSound) {
          if (Object.keys(selectedSound).length > 0) {
            self.sound = selectedSound;
            self.isPlaying = false;
            self.showImage();
          }
        })
      },
      controllerAs: 'ic'
    };

    return directive;
  }
  imageContainer.$inject = ["AppService", "SoundCloudAPI", "$timeout"];

})();

(function() {
  'use strict';

  angular
    .module('soundcloudApp')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
  routeConfig.$inject = ["$routeProvider"];

})();

(function() {
  'use strict';

  angular
    .module('soundcloudApp')
    .config(config);

  /** @ngInject */
  function config($logProvider) {
    // Enable log
    $logProvider.debugEnabled(true);
  }
  config.$inject = ["$logProvider"];

})();

angular.module("soundcloudApp").run(["$templateCache", function($templateCache) {$templateCache.put("app/imageContainer/imageContainer.html","<div class=\"imageContainer animated\"><div class=\"image\" ng-click=\"ic.startPlay()\"><img ng-src=\"{{ ic.sound.artwork_url }}\"></div></div><div class=\"embed animated\"></div>");
$templateCache.put("app/main/main.html","<div class=\"container app\"><div class=\"col-lg-4\"><search></search></div><div class=\"col-lg-4\"><image-container></image-container></div><div class=\"col-lg-4\"><recent-searches></recent-searches></div></div>");
$templateCache.put("app/searchContainer/searchContainer.html","<div class=\"searchBar\"><form ng-submit=\"vm.search()\"><div class=\"input-group search-form-control\"><span class=\"input-group-addon\"><button type=\"submit\"><span class=\"glyphicon glyphicon-search\"></span></button> <i class=\"fa fa-spinner fa-spin\" ng-show=\"vm.isLoading\"></i></span> <input type=\"text\" class=\"form-control\" placeholder=\"Search\" ng-model=\"vm.searchQuery\"></div></form></div><div class=\"searchResults\"><ul class=\"list-unstyled list-group clearfix\"><li ng-repeat=\"track in vm.searchResults\" ng-click=\"vm.selectResult(track)\" ng-if=\"vm.viewMode == \'list\'\" ng-class=\"{\'list\' : vm.viewMode == \'list\'}\"><a href=\"#/\" class=\"list-group-item\">{{ track.title }}</a></li><li ng-repeat=\"track in vm.searchResults\" ng-click=\"vm.selectResult(track)\" ng-if=\"vm.viewMode == \'tiles\'\" ng-class=\"{\'tile\' : vm.viewMode == \'tiles\'}\"><img ng-src=\"{{ track.artwork_url }}\"></li></ul></div><div class=\"searchControls clearfix\"><button class=\"btn btn-default pull-left\" ng-click=\"vm.next()\"><span class=\"glyphicon glyphicon-arrow-right\"></span></button><div class=\"pull-right\"><button class=\"btn btn-default\" ng-class=\"{\'active\' : vm.viewMode == \'list\'}\" ng-click=\"vm.setViewMode(\'list\')\"><i class=\"fa fa-list\"></i></button> <button class=\"btn btn-default\" ng-class=\"{\'active\' : vm.viewMode == \'tiles\'}\" ng-click=\"vm.setViewMode(\'tiles\')\"><i class=\"fa fa-th\"></i></button></div></div>");
$templateCache.put("app/recentSearches/recentSearches.html","<h4>Recent Searches</h4><ul class=\"list-unstyled\"><li ng-repeat=\"search in vm.recentSearches track by $index\">{{ search }}</li></ul>");}]);
//# sourceMappingURL=../maps/scripts/app-32f0dc6f7c.js.map
