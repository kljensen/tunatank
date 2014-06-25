'use strict';

describe('Service: tankService', function () {

  // load the service's module
  beforeEach(module('tunatankApp'));

  // instantiate service
  var tankService;
  beforeEach(inject(function (_tankService_) {
    tankService = _tankService_;
  }));

  it('should do something', function () {
    expect(!!tankService).toBe(true);
  });

});
