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
  	var maxRounds = 3;

  	var rounds = [
  		{
  			initialCapital: 100000,
  			investmentIncrement: 10000,
  			showValuations: false,
  			separateFounders: true
  		},
  		{
  			initialCapital: 1000000,
  			investmentIncrement: 100000,
  			showValuations: true,
  			separateFounders: false
  		},
  		{
  			initialCapital: 1000000,
  			investmentIncrement: 100000,
  			showValuations: true,
  			separateFounders: false
  		},
  	];

    // Reset the tank
    function resetTank () {
    	console.log('restting!');
    	tank.$set({
    		entrepreneurs: [],
    		investors: [],
    		currentRound: -1
    	})
    }

    function addEntrepreneur (){
    	console.log('adding entrepreneur!');
    	entrepreneurs.$add({
    		name: "",
    		companyName: "",
    		urlSlug: "",
    		premoneyValuations: [1000000, null, null]
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
    	if (!investor['name']){
    		console.log("Creating investor with empty investments");
    		investor['name'] = "";
    		investor['investments'] = [{}, {}, {}];
    	}
    	return investor;
    }

    function getForCurrentRound(attribute){
    	return rounds[tank.currentRound][attribute];
    }

    return {
    	bar: 'fucking shit',
    	tank: tank,
    	entrepreneurs: entrepreneurs,
    	investors: investors,
    	resetTank: resetTank,
    	addEntrepreneur: addEntrepreneur,
    	getOrCreateInvestor: getOrCreateInvestor,
    	getForCurrentRound: getForCurrentRound,
    	rounds: rounds,
    }
  }]);
