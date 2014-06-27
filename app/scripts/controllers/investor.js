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
		$scope.me = TankService.getOrCreateInvestor();
		$scope.me.$bind($scope, 'me');
		$scope.foo = "wot";
		$scope.entrepreneurs = TankService.entrepreneurs;
		$scope.tank = TankService.tank;
		console.log($scope.me);
		function add(x, y){
			return x + y;
		}

		$scope.getRemainingCapital = function(){
			var invested = 0;
			var round = $scope.tank.currentRound;
			if (_.isUndefined(round)) {
				return null;
			};
			if (_.isUndefined($scope.me.investments)) {
				// TODO, do this in service
				$scope.me.investments = [{}, {}, {}];
			};
			var currentRoundInvestments = $scope.me.investments[round];
			if (!_.isEmpty(currentRoundInvestments)) {
				var amounts = _.pluck(currentRoundInvestments, 'amount');
				invested = _.reduce(amounts, add);				
			};
			return TankService.getForCurrentRound('initialCapital') - invested;
		}

		$scope.changeInvestment = function(entrepreneurUrlSlug, upward){
			var myInvestments = $scope.me.investments[$scope.tank.currentRound];
			console.log('myInvestments = ', myInvestments);
			if (!_.has(myInvestments, entrepreneurUrlSlug)) {
				myInvestments[entrepreneurUrlSlug] = {amount: 0};
			};
			var increment = TankService.rounds[$scope.tank.currentRound].investmentIncrement;
			if (upward != true) {
				increment *= -1 
			};
			if (increment > $scope.getRemainingCapital()) {
				console.log("Cannot invest what you don't have!");
			}else if(myInvestments[entrepreneurUrlSlug].amount + increment < 0){
				console.log("Cannot make a negative investment!");
			}else{
				myInvestments[entrepreneurUrlSlug].amount += increment;
			};
		}

		$scope.getRoundTitle = function(){
			var round = $scope.tank.currentRound;
			if (round < 0 || _.isUndefined(round)){
				return "Initialization";
			};
			return TankService.rounds[$scope.tank.currentRound].title;
		}

	}]);
