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
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.bar = TankService.bar;
    $scope.tank = TankService.tank;
    $scope.addEntrepreneur = TankService.addEntrepreneur;
    $scope.resetTank = TankService.resetTank;
  }]);
