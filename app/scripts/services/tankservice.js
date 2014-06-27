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
    		currentRound: -1,
        done: false,
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
      var bonuses = {};
      var finalValues = {};

      for (var i in entrepreneurs.$getIndex()){
        var eid = entrepreneurs.$getIndex()[i];
        var entrepreneur = entrepreneurs[eid];
        slugToEID[entrepreneur.urlSlug] = eid;
        bonuses[entrepreneur.urlSlug] = null;
        finalValues[entrepreneur.urlSlug] = null;
        var premoneyValuation = entrepreneur.premoneyValuations[tank.currentRound];
        sumPremoney += premoneyValuation;

        var postmoneyValuation = premoneyValuation + (sumInvestments[entrepreneur.urlSlug] || 0);
        console.log('Setting postmoneyValuations for round', tank.currentRound);
        entrepreneurs[eid].postmoneyValuations[tank.currentRound] = postmoneyValuation;
      }

      // Calculate the bonuses, which is a pro-rata distribution
      // of the appreciation in this round.
      // 
      var totalBonus = rounds[tank.currentRound].appreciation * sumPremoney;
      var totalInvestedThisRound = _.max([1, _.reduce(_.values(sumInvestments), add)]);
      for (var i in entrepreneurs.$getIndex()){
        var eid = entrepreneurs.$getIndex()[i];
        var entrepreneur = entrepreneurs[eid];
        var slug = entrepreneur.urlSlug;
        console.log('totalInvestedThisRound', totalInvestedThisRound);
        bonuses[slug] = totalBonus * (sumInvestments[slug] || 0) / totalInvestedThisRound;
        entrepreneurs[eid].bonuses[tank.currentRound] = bonuses[slug];
        finalValues[slug] = 
          entrepreneurs[eid].postmoneyValuations[tank.currentRound] 
            + bonuses[slug];
        entrepreneurs[eid].finalValues[tank.currentRound] = finalValues[slug];

      };

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

    function getSlug2Eid () {
      var slug2eid = {};
      entrepreneurs.$getIndex().forEach(function(eid) {
        slug2eid[entrepreneurs[eid].urlSlug] = eid;
      })
      return slug2eid;
    }

    function finishContest(){
      var slug2eid = getSlug2Eid();
      var positions = {};
      console.log('positions =', positions);
      investors.$getIndex().forEach(function(investorUUID) {
        var investor = investors[investorUUID];
        positions[investorUUID] = {};
        for (var i = 0; i < rounds.length; i++) {
          if (_.isUndefined(investor.investments)) {
            continue;
          };
          _.forOwn(investor.investments[i], function(investment, slug){
            var eid = slug2eid[slug];
            if (_.isUndefined(eid)) {
              // dummy
              return;
            };
            var entrepreneur = entrepreneurs[eid];
            console.log('investment of ', investment.amount);
            var purchasedPercent = investment.amount / entrepreneur.postmoneyValuations[i];
            console.log('purchasedPercent = ', purchasedPercent);

            if(!_.has(positions[investorUUID], eid)){
              positions[investorUUID][eid] = {
                purchasedPercent: 0,
                totalInvestment: 0,
              }
            }
            positions[investorUUID][eid].purchasedPercent += purchasedPercent;
            positions[investorUUID][eid].totalInvestment += investment.amount;
            console.log(positions[investorUUID][eid]);
          });
        };
        investors[investorUUID].positions = positions[investorUUID];
      });
      investors.$save();
      console.log(positions);
      console.log('MARKING done');
      tank.done = true;
      tank.$save();
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
      maxRounds: rounds.length,
      finishContest: finishContest
    }
  }]);
