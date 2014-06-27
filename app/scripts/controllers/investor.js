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
		var bootstrapped = false;
		TankService.investors.$bind($scope, 'investors').then(function(){
			console.log('we are bootstrapped');
			bootstrapped = true;
			console.log($scope.investors);
			$scope.myUUID = TankService.getOrCreateInvestor();
		});
		$scope.foo = "wot";
		$scope.entrepreneurs = TankService.entrepreneurs;
		$scope.tank = TankService.tank;


		$scope.getRemainingCapital = function(){
			if (_.isUndefined($scope.myUUID)) {
				return null;
			};
			console.log('woot');
			return TankService.getRemainingCapital($scope.myUUID);
		}

		$scope.changeInvestment = function(entrepreneurUrlSlug, upward){
			return TankService.changeInvestment($scope.myUUID, entrepreneurUrlSlug, upward);
		}

		$scope.getRoundTitle = function(){
			var round = $scope.tank.currentRound;
			if (round < 0 || _.isUndefined(round)){
				return "Initialization";
			};
			return TankService.rounds[$scope.tank.currentRound].title;
		}

		$scope.showEntrepreneur = function() {
			var round = $scope.tank.currentRound;
			if (round < 0 || _.isUndefined(round)){
				return false;
			};
			return TankService.rounds[round].showEntrepreneur;
		}

		$scope.getCurrentInvestment = function(slug){
			if (!bootstrapped) {
				return null;
			};
			if (!_.has($scope.investors, $scope.myUUID)){
				return null;
			}
			if (!_.has($scope.investors[$scope.myUUID], 'investments')){
				return null;
			}
			console.log('investments =', $scope.investors[$scope.myUUID].investments);
			var investment = $scope.investors[$scope.myUUID].investments[$scope.tank.currentRound][slug];
			if (_.isUndefined(investment)) {
				return 0;
			};
			return investment.amount;
		}

	}]);
