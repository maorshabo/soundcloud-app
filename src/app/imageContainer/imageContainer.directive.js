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
              imageContainer.addClass('fadeOut');
            });
          });
        };

        ctrl.showImage = function() {
          embedElm.addClass('fadeOut');
          imageContainer.show().removeClass('fadeOut');
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

})();
