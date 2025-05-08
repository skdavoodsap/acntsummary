/*global QUnit*/

sap.ui.define([
	"comsharp/acntsummary/controller/claimsMainView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("claimsMainView Controller");

	QUnit.test("I should test the claimsMainView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
