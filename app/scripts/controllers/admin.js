'use strict';

/**
 * @ngdoc function
 * @name tunatankApp.controller:AdminCtrl
 * @description
 * # AdminCtrl
 * Controller of the tunatankApp
 */
angular.module('tunatankApp')
  .controller('AdminCtrl', ['$scope', 'TankService', function ($scope, TankService) {

    $scope.bar = TankService.bar;
    TankService.tank.$bind($scope, 'tank');
    TankService.entrepreneurs.$bind($scope, 'entrepreneurs');
    $scope.addEntrepreneur = TankService.addEntrepreneur;
    $scope.resetTank = TankService.resetTank;

    $scope.incrementRound = function(){
      if ($scope.tank.currentRound + 1 >= TankService.maxRounds) {
        TankService.recomputeValuations();
        TankService.finishContest();
        return;
      };
      TankService.recomputeValuations();
      $scope.tank.currentRound += 1;
  	}
    $scope.decrementRound = function(){
      if ($scope.tank.currentRound == -1) {
        return;
      };
  		$scope.tank.currentRound -= 1;
  	}

    $scope.finishContest = function(status) {
      if (!_.isUndefined(status) && status == false) {
        console.log('setting to false');
        $scope.tank.done = false;
      }else{
        TankService.finishContest();
      };
    }

}]);
