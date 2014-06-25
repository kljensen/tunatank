'use strict';

/**
 * @ngdoc service
 * @name tunatankApp.tankService
 * @description
 * # tankService
 * Service in the tunatankApp.
 */
angular.module('tunatankApp')
  .factory('TankService', ['$firebase', function TankService($firebase) {
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
    return {
    	bar: 'fucking shit',
    	tank: tank,
    	resetTank: resetTank,
    	addEntrepreneur: addEntrepreneur,
    }
  }]);
