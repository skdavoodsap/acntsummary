/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */
sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel",
		"sap/ui/Device"], function(UIComponent, JSONModel, Device) {
	"use strict";

	return UIComponent.extend("com.sharp.acntsummary.Component", {
		metadata : {
			"sap.app" : {
				"title" : "Account Summary"
			},
			title : "Account Summary",

			rootView : "acntsummary.view.App",
			routing : {
				config : {
					routerClass : "sap.m.routing.Router",
					viewPath : "acntsummary.view",
					controlId : "fioriContent",
					controlAggregation : "pages",
					viewType : "XML"
				},
				routes : [{
					name : "accountSummaryMainView",
					// empty hash - normally the start page
					pattern : "",
					target : "accountSummaryMainView"
				}, {
					name : "claimsSubmitReport",
					pattern : "claimsSubmitReport/{Id}",
					target : "claimsSubmitReport"
				},{
			    	"path": "/services/userapi", 
			    	"target": {
			    		"type": "service",
			    		"name": "userapi"
			    	}
				}],
				targets : {
					accountSummaryMainView : {
						viewName : "accountSummaryMainView",
						viewLevel : 0
					},
					claimsSubmitReport : {
						viewName : "claimsSubmitReport",
						viewLevel : 1
					}

				}
			},
			config : {
				"serviceConfig" : {
					"name" : "ZSD_ACCOUNT_SUMMARY_SRV",
					"serviceUrl" : "/sap/opu/odata/sap/ZSD_ACCOUNT_SUMMARY_SRV/"
				}
			}
		},
		init : function() {
			UIComponent.prototype.init.apply(this, arguments);
			var mConfig = this.getMetadata().getConfig();
			var sServiceUrl = mConfig.serviceConfig.serviceUrl;

			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, {
				json : true,
				loadMetadataAsync : true
			});

			oModel.attachMetadataFailed(function() {
				this.getEventBus().publish("Component", "MetadataFailed");
			}, this);
			this.setModel(oModel,"CompModel");
			// Parse the current url and display the targets of the route that
			// matches the hash
			this.getRouter().initialize();
			
			var userLang = jQuery.sap.getUriParameters().get("eplang");
			console.log("Component userLang:",userLang);

			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleName : "acntsummary.i18n.i18n"
			});
			this.setModel(i18nModel, "i18n");

			//create device model
			var oDeviceModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "oDeviceModel");

		},
		
		getEventBus : function() {
			return sap.ui.getCore().getEventBus();
		}
	});

});

