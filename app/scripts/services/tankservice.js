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
  	var fb = $firebase(new Firebase('https://tuna-tank.firebaseio.com'));
    var tank = fb.$child('tank');
  	var entrepreneurs = fb.$child('entrepreneurs');
  	var investors = fb.$child('investors');
  	var maxRounds = 3;

  	var rounds = [
  		{
        title: "Friends, Fools and Family Round",
  			initialCapital: 100000,
  			investmentIncrement: 10000,
  			showValuations: false,
  			showEntrepreneur: true,
        appreciation: 1.25,
  		},
  		{
        title: "Angel Round",
        initialCapital: 250000,
  			investmentIncrement: 25000,
  			showValuations: true,
  			showEntrepreneur: false,
        appreciation: 1.5,
  		},
      {
        title: "Venture Round (Series A)",
        initialCapital: 1000000,
        investmentIncrement: 100000,
        showValuations: true,
        showEntrepreneur: false,
        appreciation: 2,
      },
      {
        title: "Venture Round (Series B)",
  			initialCapital: 2000000,
  			investmentIncrement: 100000,
  			showValuations: true,
  			showEntrepreneur: false,
        appreciation: 3,
  		},
  	];

    function add(x, y){
      return x + y;
    }

    // Reset the tank
    function resetTank () {
    	console.log('restting!');
    	tank.$set({
    		currentRound: -1
    	})
      entrepreneurs.$set([]);
      investors.$set({});
    }

    function addEntrepreneur (){
    	console.log('adding entrepreneur!');
    	entrepreneurs.$add({
    		name: "",
    		companyName: "",
    		urlSlug: "",
        // Setting stuff to -1 b/c firebase behaves weird with nulls and zeros
        premoneyValuations: [1000000, -1, -1, -1],
        postmoneyValuations: [-1, -1, -1, -1],
        bonuses: [-1, -1, -1, -1],
    		finalValues: [-1, -1, -1, -1]
    	})
    }

    function getOrCreateInvestor(){
    	var investorUUID = $cookieStore.get('investorUUID');

    	if (!investorUUID){
    		investorUUID = rfc4122.v4();
    		$cookieStore.put('investorUUID', investorUUID);
    	};
      if(!_.has(investors, investorUUID)){
        console.log('creating new investor');
        var newInvestor = {};

        // # TODO: do not hardcode number of rounds in investments
        newInvestor[investorUUID] = {name: "", investments: [{dummy:{amount: 0}}, {dummy:{amount: 0}}, {dummy:{amount: 0}}, {dummy:{amount: 0}}]}
        investors.$update(newInvestor)
      };
    	return investorUUID;
    }

    function getForCurrentRound(attribute){
      if(tank.currentRound < 0){ return null;}
    	return rounds[tank.currentRound][attribute];
    }

    function getRemainingCapital(investorUUID){
      var invested = 0;
      var round = tank.currentRound;
      if (_.isUndefined(round)) {
        return null;
      };
      if (_.isUndefined(investors[investorUUID].investments)) {
        investors[investorUUID].investments = [{dummy:{amount: 0}}, {dummy:{amount: 0}}, {dummy:{amount: 0}}, {dummy:{amount: 0}}];
      };
      var currentRoundInvestments = investors[investorUUID].investments[round];
      console.log('currentRoundInvestments =', currentRoundInvestments);
      if (!_.isEmpty(currentRoundInvestments)) {
        var amounts = _.pluck(currentRoundInvestments, 'amount');
        console.log(amounts);
        invested = _.reduce(amounts, add);        
      };
      var initialCapital = getForCurrentRound('initialCapital');
      console.log('Started with ', initialCapital, 'this round');
      console.log('have invested', invested);
      return initialCapital - invested;
    }

    function changeInvestment (investorUUID, entrepreneurUrlSlug, upward){
      var remainingCapital = getRemainingCapital(investorUUID);
      var myInvestments = investors[investorUUID].investments[tank.currentRound];
      console.log('myInvestments = ', myInvestments);
      if (!_.has(myInvestments, entrepreneurUrlSlug)) {
        myInvestments[entrepreneurUrlSlug] = {amount: 0};
      };
      var increment = rounds[tank.currentRound].investmentIncrement;
      if (upward != true) {
        increment *= -1 
      };
      if (increment > remainingCapital) {
        console.log("Cannot invest what you don't have!");
      }else if(myInvestments[entrepreneurUrlSlug].amount + increment < 0){
        console.log("Cannot make a negative investment!");
      }else{
        myInvestments[entrepreneurUrlSlug].amount += increment;
      };
      investors.$save(investorUUID);
    }

    function recomputeValuations () {
      if (tank.currentRound < 0) {
        return;
      };

      // The current round is ending. Compute the post money
      // valuation and the 'bonus'.
      //
      var i = tank.currentRound;
      var sumInvestments = {};

      // Loop over investors
      // 
      var investorUUIDs = investors.$getIndex();
      investorUUIDs.forEach(function(investorUUID) {
        var investor = investors[investorUUID];
        console.log(investor);
        console.log('Round', i, 'for investor', investor.name);

        if (!_.has(investor, 'investments')) {
          return;
        };
        var investmentsRoundi = investor.investments[i];

        // Loop over the investments they've made this round
        // 
        _.forOwn(investmentsRoundi, function(val, key) {
          console.log('\tinvested in', key);
          if (!_.has(sumInvestments, key)) {
            sumInvestments[key] = val.amount;
          }else{
            sumInvestments[key] += val.amount;
          };
        });
      })

      var sumPremoney = 0;
      var slugToEID = {};
      for (var i in entrepreneurs.$getIndex()){
        var eid = entrepreneurs.$getIndex()[i];
        var entrepreneur = entrepreneurs[eid];
        slugToEID[entrepreneur.urlSlug] = eid;
        var premoneyValuation = entrepreneur.premoneyValuations[tank.currentRound];
        sumPremoney += premoneyValuation;

        var postmoneyValuation = premoneyValuation + (sumInvestments[entrepreneur.urlSlug] || 0);
        entrepreneurs[eid].postmoneyValuations[tank.currentRound] = postmoneyValuation;
      }

      // Calculate the bonuses, which is a pro-rata distribution
      // of the appreciation in this round.
      // 
      var totalBonus = rounds[tank.currentRound].appreciation * sumPremoney;
      var bonuses = {};
      var finalValues = {};
      var totalInvestedThisRound = _.reduce(_.values(sumInvestments), add);
      _.forOwn(sumInvestments, function(val, slug){
        var eid = slugToEID[slug];
        if (_.isUndefined(eid)) {
          return;
        };
        console.log(eid);
        bonuses[slug] = totalBonus * (val / totalInvestedThisRound);
        entrepreneurs[eid].bonuses[tank.currentRound] = bonuses[slug];
        finalValues[slug] = 
          entrepreneurs[eid].postmoneyValuations[tank.currentRound] 
            + bonuses[slug];
        entrepreneurs[eid].finalValues[tank.currentRound] = finalValues[slug];

      });

      console.log('totalBonus = ', totalBonus);
      console.log('sumInvestments = ', sumInvestments);
      console.log('bonuses = ', bonuses);
      console.log('finalValues = ', finalValues);

      // Make the finalValues the premoney for the next
      // round.
      var nextRound = tank.currentRound + 1;
      if(nextRound < rounds.length){
        for (var i in entrepreneurs.$getIndex()){
          var eid = entrepreneurs.$getIndex()[i];
          var entrepreneur = entrepreneurs[eid];
          entrepreneurs[eid].premoneyValuations[nextRound] = finalValues[entrepreneur.urlSlug];
        }
      }

      entrepreneurs.$save();
      console.log(sumInvestments);
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
      recomputeValuations: recomputeValuations,
      changeInvestment: changeInvestment,
      getRemainingCapital: getRemainingCapital,
    }
  }]);
