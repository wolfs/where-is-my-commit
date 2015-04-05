require(['jasmineBoot', 'jasmineAjax'], function () {
  'use strict';
    require(['../test/specs'], function () {
      //trigger Jasmine
      window.onload();
    });
});