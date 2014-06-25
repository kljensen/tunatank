'use strict';

describe('Controller: InvestorCtrl', function () {

  // load the controller's module
  beforeEach(module('tunatankApp'));

  var InvestorCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InvestorCtrl = $controller('InvestorCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
