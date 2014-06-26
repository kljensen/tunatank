'use strict';

/**
 * @ngdoc service
 * @name tunatankApp.tankService
 * @description
 * # tankService
 * Service in the tunatankApp.
 */
angular.module('tunatankApp')
  .factory('TankService', ['$firebase', 'rfc4122', '$cookieStore', function TankService($firebase, rfc4122, $cookieStore) {
  	var tank = $firebase(new Firebase('https://tuna-tank.firebaseio.com'));
  	var entrepreneurs = tank.$child('entrepreneurs');
  	var investors = tank.$child('investors');

    // Reset the tank
    function resetTank () {
    	console.log('restting!');
    	tank.$set({
    		entrepreneurs: [],
    		investors: [],
    		currentRound: 0
    	})
    }

    function addEntrepreneur (){
    	console.log('adding entrepreneur!');
    	entrepreneurs.$add({
    		name: "",
    		companyName: "",
    		urlSlug: ""
    	})
    }

    function getOrCreateInvestor(){
    	var investorUUID = $cookieStore.get('investorUUID');
    	console.log(investorUUID);
    	console.log($cookieStore);

    	if (!investorUUID){
    		investorUUID = rfc4122.v4();
    		$cookieStore.put('investorUUID', investorUUID);
    	};
		var investor = investors.$child(investorUUID);
    	if (_.isEmpty(investor)){
    		investor = {name: ""}
    	}
    	return investor;
    }

    return {
    	bar: 'fucking shit',
    	tank: tank,
    	resetTank: resetTank,
    	addEntrepreneur: addEntrepreneur,
    	getOrCreateInvestor: getOrCreateInvestor,
    }
  }]);
