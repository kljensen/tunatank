'use strict';

/**
 * @ngdoc overview
 * @name tunatankApp
 * @description
 * # tunatankApp
 *
 * Main module of the application.
 */
var tunatankApp = angular
  .module('tunatankApp', [
    'ngRoute', 'ngAnimate', 'firebase'
  ]);

tunatankApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);
