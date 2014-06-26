'use strict';

/**
 * @ngdoc function
 * @name tunatankApp.controller:InvestorCtrl
 * @description
 * # InvestorCtrl
 * Controller of the tunatankApp
 */
angular.module('tunatankApp')
	.controller('InvestorCtrl', ['$scope', 'TankService', function ($scope, TankService) {
		console.log('in InvestorCtrl');
		var investor = TankService.getOrCreateInvestor();
		investor.$bind($scope, 'me');
		$scope.foo = "wot";

	}]);
