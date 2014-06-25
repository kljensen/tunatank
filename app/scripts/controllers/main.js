'use strict';

/**
 * @ngdoc function
 * @name tunatankApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tunatankApp
 */
angular.module('tunatankApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    console.log('MainCtrl');
  });
