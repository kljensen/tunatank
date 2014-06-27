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
  		$scope.tank['currentRound'] += 1;
      TankService.recomputeValuations();
  	}
    $scope.decrementRound = function(){
  		$scope.tank['currentRound'] -= 1;
  	}

}]);
