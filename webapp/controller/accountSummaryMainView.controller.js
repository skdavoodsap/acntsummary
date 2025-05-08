sap.ui.define(
	[
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/util/Export',
		'sap/ui/core/util/ExportTypeCSV',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
		'sap/m/BusyDialog',
		'sap/ui/core/format/NumberFormat',
		'sap/ui/Device',
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter",
		"sap/ui/export/library",
		"sap/ui/export/Spreadsheet",	
		"com/sharp/acntsummary/utils/jspdf.umd.min",
		"../model/formatter"
	],
	function (Controller, Export, ExportTypeCSV, JSONModel, MessageBox, BusyDialog, 
			NumberFormat, Device, Filter, FilterOperator, Sorter, 
			exportLibrary, Spreadsheet, jsPDF, formatter) {
		"use strict";
		var oBackendModel, that, oLocalModel, 
			oComponent, sFlag, oView,
			iItemsCount, oBusyDialog, aSearchResults;
		const EdmType = exportLibrary.EdmType;
		var CController = Controller.extend("com.sharp.acntsummary",
			{
				formatter: formatter,
				onInit: function () {

					this.claimsByUser = null;
					this.isClaimsDateFrom = null;
					this.isClaimsDateTo = null;
					this.statusTypes = null;
					this.textDealerName = null;
					this.selectedStatusTypes = "";
					oBusyDialog = new BusyDialog();
					this.isUserAdmin = "N";
					this.isUserView = 'N';
					this.userInfo = null;

					this.programTypes = 'ALL';
					this.selectedProgramTypes = "";

					//var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					//oRouter.attachRouteMatched(this.onDataReceived , this);

					oView = this.getView();

					that = this;
					oComponent = this.getOwnerComponent();
					oBackendModel = oComponent.getModel("acntSummary");
					// set message model
					var oMessageManager = sap.ui.getCore().getMessageManager();
					oView.setModel(oMessageManager.getMessageModel(), "message");
					// or just do it for the whole view
					oMessageManager.registerObject(oView, true);

					// set device model
					var oDeviceModel = new JSONModel(Device);
					//oDeviceModel.setDefaultBindingMode("OneWay");
					oView.setModel(oDeviceModel, "device");


					this.claimHeaderDetails = null;

					this.userID = null;
					this.plantID = null;
					this.initrun = 'Y';
					this.epuser = "";
					//total = 0;
					this.returnMessage = "";
					this.isDefectREquired = "";
					this.dealerCheck = "E";

					var userIDPortal = jQuery.sap.getUriParameters().get("epuser");
					this.userEmailID = jQuery.sap.getUriParameters().get("epmail");
					this.userFname = jQuery.sap.getUriParameters().get("epfname");
					// get application parameter from
					// iView
					if (jQuery.sap.getUriParameters() != null
						&& jQuery.sap
							.getUriParameters() != undefined) {

						if (userIDPortal != null && userIDPortal != undefined) {
							this.epuser = userIDPortal;
						}
					}

					if (this.epuser != "" && this.epuser != null && this.epuser != undefined) {
						this.userID = this.epuser.toUpperCase();
						//this.onGetCompCodes(this.userID);
					}

					//this.onGetCompCods(this.userID);
					//this.onLoadProgramTypes();

					that.getCustomers(this.userID);
					// that.onGetUserDetailsZZZ(this.userID);	

					// this.onUIUpdate();
					//	var toDate = new Date();
					//	var frmDate  = toDate.setMonth(toDate.getMonth() - 6);
					oLocalModel = new JSONModel({
						: "",CustNum
						FromDate: "",
						ToDate: "",
						Size: 0,
						Currency: "USD",
						TotalOpen: 0,
						TotalCleared: 0,
						TotVis: false,
						TotClearVis: false,
						TotOpenVis: false,
						DatesVis: false,
						pastXDVis: false,
						fixedBottom: 0,
						globalFilter: ""
					});
					oLocalModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);

					oView.setModel(oLocalModel, "oLocalModel");
					this.onDatesInitialize();



				},
				onSelect: function (oEvent) {
					//SHAIKD Below Line Commented 19/Dec/2024
					//oView.byId("dealerinfo").setVisible(true);
					oView.byId("dealerid").setText(oEvent.getParameters().selectedItem.getKey());
					oView.byId("dealername").setText(oEvent.getParameters().selectedItem.getText());
				},
				onSelectCompanycode: function (oEvent) {
					//SHAIKD onSelectCompanycode 24/Jan/2024
					//debugger;
					var compcode = oEvent.getParameters().selectedItem.getKey();
					console.log("Company Code : " + compcode);
					//var compcode = that.getView().byId("compcode").getSelectedKey();
							if ("2010" == compcode) {
								oLocalModel.setProperty("/Currency", "USD");
							}
							else if ("2050" == compcode) {
								oLocalModel.setProperty("/Currency", "CAD");
							}
				},
		
				getCustomers: function (userid) {
					// creating filters for the odata read operation
					var f_user = new sap.ui.model.Filter({
						path: "User",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: userid
					});
					// call odata method
					//oBackendModel.read("/custSet", {
					this.getOwnerComponent().getModel("userlist").read("/CustListSet", {
						filters: [f_user],
						success: function (oData) {

							var oGlobMod = oView.getModel("oLocalModel");
							//var testingflag = 1;
							if (oData.results.length == 1) {
							//if (testingflag == 1) {
								// Single Customer
								oGlobMod.setProperty("/isInternal", true);
								//SHAIKD Below Line Commented  19/Dec/2024
								//oView.byId("dealerinfo").setVisible(true);
								oView.byId("dealerid").setText(oData.results[0].EtCustList.CustomerNo);
								oView.byId("dealername").setText(oData.results[0].EtCustList.Name);
								oView.byId("CustNum").setVisible(false);
								oView.byId("CustNumInp").setVisible(false);
								oView.byId("CustDrp").setVisible(false);
								oView.byId("idLblCompCode").setVisible(false);
								oView.byId("idSelCompCode").setVisible(false);
								// oView.byId("CustomerTextInputTo").setWidth('21rem');
								// oView.byId("CustomerTextInputTo").addStyleClass("CustDrp");
								oView.byId("CustNumInp").setValue(oData.results[0].EtCustList.CustomerNo);
								oGlobMod.setProperty("/CustNum", oData.results[0].EtCustList.CustomerNo);
							}
							else if (oData.results.length > 1) {
								oGlobMod.setProperty("/isInternal", true);
								var aCustomers = [];
								for (var i = 0; i < oData.results.length; i++) {
									aCustomers.push({
										"Customerno": oData.results[i].EtCustList.CustomerNo.replace(/^0+/, ''),
										"Name": oData.results[i].EtCustList.Name
									});
								}
								oView.byId("CustDrp").setVisible(true);
								oView.byId("dealerinfo").setVisible(false);
								oView.byId("CustNumInp").setVisible(false);
								oView.byId("CustNum").setVisible(true);

								oGlobMod.setProperty("/Customers", aCustomers);
							}
							else {
								oGlobMod.setProperty("/isInternal", false);
								oView.byId("CustDrp").setVisible(false);
								oView.byId("CustNumInp").setVisible(true);
								oView.byId("CustNum").setVisible(true);
							}
							sap.ui.core.BusyIndicator.hide();

						},
						error: function (oError) {
							sap.ui.core.BusyIndicator.hide();
							var data = JSON.stringify(oError);
							//var message = $(oError.response.body).find("message").first().text();
							//MessageToast.show(message);
							var errMsg = oError.message + "  " + oError.statusCode + " " + oError.statusText;
							MessageBox.error("" + errMsg);
						}
					});
				},
				getCustomers1ZZZ: function (userid) {
					/*
					// creating filters for the odata read operation
					var f_user = new sap.ui.model.Filter({
						path: "User",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: userid
					});
					// call odata method
					oBackendModel.read("/custSet", {
						filters: [f_user],
						success: function (oData) {
							var oGlobMod = oView.getModel("oLocalModel");
							if (oData.results.length > 0) {
								oGlobMod.setProperty("/isInternal", true);
								var aCustomers = [];
								for (var i = 0; i < oData.results.length; i++) {
									aCustomers.push({
										"Customerno": oData.results[i].CustList.Customerno,
										"Name": oData.results[i].CustList.Name
									});
								}
								oView.byId("CustDrp").setVisible(true);
								oView.byId("CustNumInp").setVisible(false);

								oGlobMod.setProperty("/Customers", aCustomers);
							}
							else {
								oGlobMod.setProperty("/isInternal", false);
							}
							sap.ui.core.BusyIndicator.hide();

						},
						error: function (oError) {
							sap.ui.core.BusyIndicator.hide();
							var data = JSON.stringify(oError);
							var message = $(oError.response.body).find("message").first().text();
							that.onUserMessage(message, "E");
						}
					});
					*/
				},

				// Method to reset all the filters and sorters applied to the table during current user session
				resetTable: function () {
					// var oTableEmpl = that.getView().byId("accountSummaryTable");
					// var oListBinding = oTableEmpl.getBinding();
					// oListBinding.aSorters = null;
					// oListBinding.aFilters = null;
					// that.getView().getModel("openItems").refresh(true);

					var table = that.getView().byId("accountSummaryTable");

					var iColCounter = 0;
					table.clearSelection();
					var iTotalCols = table.getColumns().length;
					var oListBinding = table.getBinding("rows");
					oListBinding.refresh();

					if (oListBinding) {
						oListBinding.aSorters = null;
						oListBinding.aFilters = null;
					}
					table.getModel("openItems").setData(aSearchResults);
					table.getModel("openItems").refresh(true);

					for (iColCounter = 0; iColCounter < iTotalCols; iColCounter++) {
						table.getColumns()[iColCounter].setSorted(false);
						table.getColumns()[iColCounter].setFilterValue("");
						table.getColumns()[iColCounter].setFiltered(false);
					}
					this.onFilter(null, "accountSummaryTable");
				},

				// Method to export table data into a PDF document and download locally on user's machine.
				//This uses a third party API called jsPDF. It has been declared as a dependency in the manifest.json
				exportToPDF: function () {

					// Default export is a4 paper, portrait, using milimeters for units 
					var doc = new jspdf.jsPDF();
					var openItems = that.getView().getModel("openItems");
					var aData = openItems.oData;
					var imgData = "data:image/png;base64,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";
					//											//
					doc.addImage(imgData, 'PNG', 170, 5, 10, 5);

					//									doc.setDrawColor(0);
					//									doc.setFillColor(46,49,146);
					//doc.setFontStyle('bold');
					doc.setFontSize(8);
					//doc.rect(15, 4, 45, 5); // filled square
					doc.text(16, 8, 'Account Summary Report');
					var curr = oLocalModel.getProperty("/Currency");

					//						header start

					//doc.setFillColor(46,49,146);

					var iLength = 15;
					var iBreadth = 15;
					doc.setFontSize(6);

					doc.rect(iLength, iBreadth, 15, 5); // empty square	
					doc.text(iLength + 1, iBreadth + 3, 'Doc #');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Doc. Type');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Order #');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Ref #');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Assignment #');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Doc. Date');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Due Date');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Status');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Terms #');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Amt');
					iLength = iLength + 15;
					doc.rect(iLength, iBreadth, 15, 5); // empty square
					doc.text(iLength + 1, iBreadth + 3, 'Curr');

					var iYCordinate = 15;
					var iXCordinate = 0;
					//doc.setFontStyle('normal');
					for (var k = 0; k < aData.length; k++) {
						iYCordinate = iYCordinate + 5;
						iXCordinate = 0;
						if (k % 50 == 0 && (k != 0)) {
							doc.addPage();
							iYCordinate = 15;
						}
						doc.setFontSize(6);
						for (var i = 0; i < 11; i++) {
							doc.setDrawColor(0);
							doc.setFillColor(46, 49, 146);

							iXCordinate = iXCordinate + 15;
							doc.rect(iXCordinate, iYCordinate, 15, 5); // empty square

							if (i == 0) {
								doc.text(iXCordinate + 1, iYCordinate + 3, aData[k].Belnr);
							}
							else if (i == 1) {
								var temp = doc.splitTextToSize(aData[k].Ltext, 15)
								doc.text(iXCordinate + 1, iYCordinate + 2, temp);
								//doc.text(iXCordinate+1, iYCordinate+3, aData[k].Ltext);
							}
							else if (i == 2) {
								doc.text(iXCordinate + 1, iYCordinate + 3, aData[k].Salesorder);
							}
							else if (i == 3) {
								var temp = doc.splitTextToSize(aData[k].Xblnr, 15)
								doc.text(iXCordinate + 1, iYCordinate + 2, temp);
								//doc.text(iXCordinate+1, iYCordinate+3, aData[k].Xblnr);
							}
							else if (i == 4) {
								var temp = doc.splitTextToSize(aData[k].Zuonr, 15)
								doc.text(iXCordinate + 1, iYCordinate + 2, temp);
							}
							else if (i == 5) {
								doc.text(iXCordinate + 1, iYCordinate + 3, that.dateFormat(aData[k].Zfbdt));
							}
							else if (i == 6) {
								doc.text(iXCordinate + 1, iYCordinate + 3, that.dateFormat(aData[k].Zaldt));
							}

							else if (i == 7) {
								doc.text(iXCordinate + 1, iYCordinate + 3, that.statusFormat(aData[k].Type));
							}
							else if (i == 8) {
								doc.setFontSize(4);
								var temp = doc.splitTextToSize(aData[k].ZtermText, 15)
								doc.text(iXCordinate + 1, iYCordinate + 2, temp);
							}
							else if (i == 9) {
								doc.text(iXCordinate + 1, iYCordinate + 3, that.currFormatC(aData[k].Wrbtr));
							}
							else if (i == 10) {
								doc.text(iXCordinate + 1, iYCordinate + 3, curr);
							}
						}
					}
					doc.save('AccountSummary.pdf')


				},

				// Hook method invoked after rendering of the DOM.
				// We instantiate Backend OData model here.
				onAfterRendering: function () {
					var oComponent = this.getOwnerComponent();
					var oDeviceModel = oComponent.getModel("oDeviceModel");
					if (oDeviceModel.getData().system.desktop) {
						oView.byId("accountSummaryTable").setVisible(true);
						oView.byId("accountSummaryTabMob").setVisible(false);
						oView.byId("totalsBarMob").setVisible(false);
					}
					else {
						oView.byId("accountSummaryTable").setVisible(false);
						oView.byId("accountSummaryTabMob").setVisible(true);
						oView.byId("totalsBarMob").setVisible(true);
					}

					console.log(oDeviceModel.getData());
					var oTable = this.getView().byId("accountSummaryTable");
					oTable.addEventDelegate({
						onAfterRendering: function (oEvent) {
							var oBinding = oTable.getBinding("rows");

							oBinding.attachChange(this.onChange);
						}.bind(this)
					});
				},

				// Method to add leading zeroes to Customer number field
				addLeadingZeroes: function (sCustnum) {
					var sKunnr = sCustnum;
					var iLength = sCustnum.length;
					var iZeroCount = 10 - iLength;
					for (var i = 0; i < iZeroCount; i++) {
						sKunnr = "0".concat(sKunnr);
					}
					sKunnr = sKunnr.trim();
					return sKunnr;
				},
				filterStd: function (oEvent) {
					var sTabName = oEvent.getSource().data("tabname");
					var oItems = null;
					var oTable = null;
					var sType = "";
					var oBindings = null;
					//var oFilter = null;
					var totOpen, totClear, Wrbtr, iLength;
					if ("accountSummaryTabMob" == sTabName) {
						oTable = oView.byId("accountSummaryTabMob");
						//oItems = oTable.getItems();
						oBindings = oTable.getBinding('items');
						oBindings.attachChange(function (oEvent) {
							iLength = oEvent.getSource().iLength;
							oTable = oView.byId("accountSummaryTabMob");
							oItems = oTable.getItems();
						});
					}
					else if ("accountSummaryTable" == sTabName) {
						oTable = oView.byId("accountSummaryTable");
						//oItems = oTable.getRows();
						oBindings = oTable.getBinding('rows');
						oBindings.attachChange(function (oEvent) {
							iLength = oEvent.getSource().iLength;
							oTable = oView.byId("accountSummaryTable");
							oItems = oTable.getRows();
						});
					}
					oView.byId("tableFooter").setVisible(true);
				},

				// Method to validate input selection criteria and pass to OData model for retreiving report
				// results from SCD,Q,P											
				onSearchBtn: function () {

					oLocalModel.setProperty("/globalFilter", "");
					var custnum1 = oLocalModel.getProperty("/CustNum");
					var oCustInp = null;
					if (oLocalModel.getProperty("/isInternal")) {
						oCustInp = that.getView().byId("CustDrp");
					}
					else {
						oCustInp = that.getView().byId("CustNumInp");
					}


					oCustInp.setValueState(sap.ui.core.ValueState.None);
					var fromDate = null;
					var toDate = null;

					// validate comp code
					if (custnum1 == "") {
						oCustInp.setValueState(sap.ui.core.ValueState.Error);
						oCustInp.setValueStateText("Customer number is required");
						return;
					}
					if (custnum1.length > 10) {
						oCustInp.setValueState(sap.ui.core.ValueState.Error);
						oCustInp.setValueStateText("Enter a value with no more than 10 characters");
						return;
					}
					this.getOpenItems();
					var sAddress = "";
					//var selectRadio = that.getView().byId("rbg1").getSelectedIndex();
					//var rd1Sel = that.getView().byId("rd1").getSelected();
					var rd2Sel = oView.byId("rbg2").getSelectedIndex();
					var rd2SelVis = oView.byId("rbg2").getVisible();
					//var rd3Sel = that.getView().byId("rd3").getSelected();

					if (rd2Sel == 0 && rd2SelVis) {
						//var pastXDays = that.getView().byId("pastXDays").getSelectedKey();
						var pastXDays = 30;
						var today = new Date();
						var dateLimit = new Date(new Date().setDate(today.getDate() - parseInt(pastXDays)));
						that.getView().byId("idInspectionDateTo").setDateValue(today);
						that.getView().byId("idInspectionDateFrom").setDateValue(dateLimit);
						fromDate = today;
						toDate = dateLimit;
						sFlag = "C";
					}
					else if (rd2Sel == 1 && rd2SelVis) {
						fromDate = oLocalModel.getProperty("/FromDate");
						toDate = oLocalModel.getProperty("/ToDate");
						var fromDateMdl = fromDate.substring(4, 6) + "/" + fromDate.substring(6, 8) + "/" + fromDate.substring(0, 4);
						//																							
						var toDateMdl = toDate.substring(4, 6) + "/" + toDate.substring(6, 8) + "/" + toDate.substring(0, 4);
						//																							
						var oFromDate = that.getView().byId("idInspectionDateFrom");
						var oToDate = that.getView().byId("idInspectionDateTo");
						oFromDate.setValueState(sap.ui.core.ValueState.None);
						oToDate.setValueState(sap.ui.core.ValueState.None);
						if (fromDate == "") {
							oFromDate.setValueState(sap.ui.core.ValueState.Error);
							oFromDate.setValueStateText("From Date is required");
							return;
						}
						if (toDate == "") {
							oToDate.setValueState(sap.ui.core.ValueState.Error);
							oToDate.setValueStateText("To Date is required");
							return;
						}
						sFlag = "C";
					}

					// call odata to get sAddress of the customer.

					//	var custnum1 = oModel.getProperty("/CustNum");		
					var custnum = this.addLeadingZeroes(custnum1);
					var currDate = new Date();
					var currDate1 = that.yyyymmdd(currDate);
					//var Month = currDate.getMonth()+1;
					//var currDate1 = currDate.getDate().concat(" ").concat(Month).concat(" ").concat(currDate.getFullYear());
					var servPath = "/salesParnrSet(VKunnr='" + custnum + "')";
					//var oView = this.getView();											
					console.log("CustomNumber", custnum);

					// call odata method
					sap.ui.core.BusyIndicator.show();
					oBackendModel.read(servPath, {
						async: true, 
						success: function (oData) {
							debugger;
							sAddress = "( ".concat(iItemsCount.toString()).concat(" ) ").concat("Open Items for").concat(" ").concat(oData.Name).concat(" (").concat(custnum1).concat(") ").concat("as of").concat(" ").concat(currDate1);

							//if (oData.Name == "") {
							//	oLocalModel.setProperty("/Address", "List of Open Items");
							//}
							//
							//var blnTestFlag = true;
							//if (blnTestFlag) {
							if (oData.Customer == "") {								
								MessageBox.error(oData.Message);
							}							
							else {
								if (rd2Sel == 0 && rd2SelVis) {
									//var pastXDays = "30";
									// var pastXDays = that.getView().byId("pastXDays").getSelectedKey();
									sAddress = "( ".concat(iItemsCount.toString()).concat(" ) ").concat("Items for").concat(" ").concat(oData.Name).concat(" (").concat(custnum1).concat(") ").concat("as of").concat(" ").concat(currDate1);
									oLocalModel.setProperty("/Address", sAddress);

								}
								else if (rd2Sel == 1 && rd2SelVis) {
									fromDate = oLocalModel.getProperty("/FromDate");
									toDate = oLocalModel.getProperty("/ToDate");
									sAddress = "( ".concat(iItemsCount.toString()).concat(" ) ").concat("Items for").concat(" ").concat(oData.Name).concat(" (").concat(custnum1).concat(") ").concat("as of").concat(" ").concat(currDate1);
									oLocalModel.setProperty("/Address", sAddress.concat(" (Includes invoices cleared between " + fromDateMdl + " and " + toDateMdl + ")"));
								}
								else {
									oLocalModel.setProperty("/Address", sAddress);
								}

							}
							var compcode = that.getView().byId("idSelCompCode").getSelectedKey();
							if ("2010" == compcode) {
								oLocalModel.setProperty("/Currency", "USD");
							}
							else if ("2050" == compcode) {
								oLocalModel.setProperty("/Currency", "CAD");
							}

							sap.ui.core.BusyIndicator.hide();
						},
						error: function (oError) {
							debugger;
							sap.ui.core.BusyIndicator.hide();
							var data = JSON.stringify(oError);
							//var message = $(oError.response.body).find("message").first().text();
							var errMsg = oError.message + "  " + oError.responseText;
							MessageBox.error(errMsg);
							that.onUserMessage(message, "E");
							result = "S";

						}
					});

				},
				// Method to update the visibility of some of the UI controls based on the radio button selection
				radioSelected: function (oEvent) {
					var id = oEvent.getSource().getId().split("--")[2];
					var index = oEvent.getSource().getSelectedIndex();
					if (index == 0) {
						oLocalModel.setProperty("/DatesVis", false);
						oLocalModel.setProperty("/pastXDVis", false);
						oView.byId("rbg2").setVisible(false);
						oView.byId("rbg2").setSelectedIndex(-1);
					}
					else if (index == 1) {
						oLocalModel.setProperty("/DatesVis", true);
						// oView.byId("fromDate").setVisibleInFilterBar(false);
						// oView.byId("toDate").setVisibleInFilterBar(false);
						// oView.byId("pastXDaysFilt").setVisibleInFilterBar(true);
						// oLocalModel.setProperty("/DatesVis",false);
						// oLocalModel.setProperty("/pastXDVis",true);
						// oView.byId("rd3").setVisible(true);
						// oView.byId("rd4").setVisible(true);
						oView.byId("rbg2").setSelectedIndex(1);
						oView.byId("frmTo").setSelected(true);
						oView.byId("rbg2").setVisible(true);

					}
				},
				radioSelected1: function (oEvent) {
					var index = oEvent.getSource().getSelectedIndex();
					if (index == 0) {
						oLocalModel.setProperty("/DatesVis", false);
					}
					else {
						oLocalModel.setProperty("/DatesVis", true);
					}

				},
				// Method to sort excluding the sum total row from standard sort mechanism
				onSort: function (oEvent) {
					var oTable = that.getView().byId("accountSummaryTable");
					var bDescending = false;
					var openItemsModel = that.getView().getModel("openItems");
					var oOrder = oEvent.mParameters.sortOrder;
					if (oOrder == "Ascending") {
						bDescending = false;
					}
					else {
						bDescending = true;
					}
					var sPath = "/" + oEvent.mParameters.column.mProperties.sortProperty;
					var oSorter = new Sorter(sPath, bDescending);
					var oTable = that.getView().byId("accountSummaryTable");
					var aData = that.getView().getModel("openItems").getData();
					var index = aData.length - 1;
					openItemsModel.oData[index].Belnr = '';
					openItemsModel.oData[index].Ltext = '';
					openItemsModel.oData[index].Salesorder = '';

					if (sPath == '/Belnr') {
						if (bDescending) {
							openItemsModel.oData[index].Belnr = '';
						}
						else {
							openItemsModel.oData[index].Belnr = '9999999999';
						}
						// autoresize columns
					}

					else if (sPath == '/Ltext') {
						if (bDescending) { openItemsModel.oData[index].Ltext = ''; }
						else { openItemsModel.oData[index].Ltext = 'ZZZZZZZZZZ'; } oTable.autoResizeColumn(1);
					}

					else if (sPath == '/Salesorder') {
						if (bDescending) { openItemsModel.oData[index].Salesorder = ''; }
						else { openItemsModel.oData[index].Salesorder = '9999999999'; }
					}

					else if (sPath == '/Xblnr') {
						if (bDescending) { openItemsModel.oData[index].Xblnr = ''; }
						else { openItemsModel.oData[index].Xblnr = 'ZZZZZZZZZZ'; }
					}

					else if (sPath == '/Zuonr') {
						if (bDescending) { openItemsModel.oData[index].Zuonr = ''; }
						else { openItemsModel.oData[index].Zuonr = 'ZZZZZZZZZZ'; }
					}

					else if (sPath == '/Zfbdt') {
						if (bDescending) { openItemsModel.oData[index].Zfbdt = ''; }
						else { openItemsModel.oData[index].Zfbdt = '99991231'; }
					}

					else if (sPath == '/Zaldt') {
						if (bDescending) { openItemsModel.oData[index].Zaldt = ''; }
						else { openItemsModel.oData[index].Zaldt = '99991231'; }
					}

					var oBindings = oTable.getBinding("rows");
					oBindings.sort(oSorter, "Application");

				},

				// Method to invoke odata call and get the list of items from 
				//(SCD,Q,P) based on selection criteria. This method is invoked from the Search method
				//within this controller.
				getOpenItems: function () {

					var oModel = that.getView().getModel("oLocalModel");
					var custnum = oModel.getProperty("/CustNum");
					var compcode = this.getView().byId("idSelCompCode").getSelectedKey();
					var fromDateMdl = "";
					var toDateMdl = "";


					var rd2Sel = that.getView().byId("rbg2").getSelectedIndex();
					var rd2SelVis = that.getView().byId("rbg2").getVisible();


					sFlag = "O";
					if (rd2Sel == 0 && rd2SelVis) {
						var pastXDays = 30;

						var today = new Date();
						var dateLimit = new Date(new Date().setDate(today.getDate() - parseInt(pastXDays)));
						that.getView().byId("idInspectionDateTo").setDateValue(today);
						that.getView().byId("idInspectionDateFrom").setDateValue(dateLimit);
						fromDateMdl = that.yyyymmdd1(dateLimit);
						toDateMdl = that.yyyymmdd1(today);
						sFlag = "";
					}
					else if (rd2Sel == 1 && rd2SelVis) {
						fromDateMdl = oModel.getProperty("/FromDate");
						toDateMdl = oModel.getProperty("/ToDate");
						var oFromDate = that.getView().byId("idInspectionDateFrom");
						var oToDate = that.getView().byId("idInspectionDateTo");
						oFromDate.setValueState(sap.ui.core.ValueState.None);
						oToDate.setValueState(sap.ui.core.ValueState.None);
						if (oFromDate.getDateValue() == "") {
							oFromDate.setValueState(sap.ui.core.ValueState.Error);
							oFromDate.setValueStateText("From Date is required");
							return;
						}
						if (oToDate.getDateValue() == "") {
							oToDate.setValueState(sap.ui.core.ValueState.Error);
							oToDate.setValueStateText("To Date is required");
							return;
						}
						sFlag = "";
					}


					//BEGIN
					// creating filters for the odata read operation
					var f_Bukrs = new sap.ui.model.Filter({
						path: "Bukrs",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: compcode
					});
					var f_Kunnr = new sap.ui.model.Filter({
						path: "Kunnr",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: custnum
					});

					var f_FrmDate = new sap.ui.model.Filter({
						path: "IvDateFrom",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: fromDateMdl
					});

					var f_ToDate = new sap.ui.model.Filter({
						path: "IvDateTo",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: toDateMdl
					});
					var f_Flag = new sap.ui.model.Filter({
						path: "IvFlag",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: sFlag
					});
					oBusyDialog.setText("Fetching data. Please wait...")
					oBusyDialog.open();
					oBackendModel.read("/openItemsSet", {
						filters: [f_Bukrs, f_Kunnr, f_FrmDate, f_ToDate, f_Flag],
						success: function (oData) {
							oBusyDialog.close();
							debugger;
							iItemsCount = oData.results.length;
							if (oData.results.length > 0) {

								oData.results.forEach(function (oItem) {
									oItem.Wrbtr = parseFloat(oItem.Wrbtr);
								});

								// populate the results on table
								var totOpen = 0;
								var totClear = 0;

								var oGlobMod = that.getView().getModel("oLocalModel");
								oGlobMod.setProperty("/TotalOpen", totOpen);
								oGlobMod.setProperty("/TotalCleared", totClear);

								//begin
								var ounique = []

								for (var a = 0; a < oData.results.length; a++) {
									var spayload = {
										"Belnr": oData.results[a].Belnr, 
										"Bschl": oData.results[a].Bschl,
										"Zterm": oData.results[a].Zterm,
										"Type": oData.results[a].Type,
										"Wrbtr": oData.results[a].Wrbtr
									};
									ounique.push(spayload);
								}

								var jsonObject = ounique.map(JSON.stringify);
								var uniqueSet = new Set(jsonObject);
								var uniqueArray = Array.from(uniqueSet).map(JSON.parse);

								for (var i = 0; i < uniqueArray.length; i++) {
									if (uniqueArray[i].Type == "O") {
										totOpen = totOpen + parseFloat(uniqueArray[i].Wrbtr);

									}
									else if (uniqueArray[i].Type == "C") {
										totClear = totClear + parseFloat(uniqueArray[i].Wrbtr);

									}
								}

								//end

								var oModel = new sap.ui.model.json.JSONModel();

								aSearchResults = oData.results;
								oModel.setData(oData.results);

								if (oData.results.length > 11) {
									oGlobMod.setProperty("/Size", 11);
								}
								else {
									oGlobMod.setProperty("/Size", oData.results.length);
								}

								if (rd2SelVis) {
									oGlobMod.setProperty("/TotOpenVis", true);
									oGlobMod.setProperty("/TotClearVis", true);
								}
								else {
									oGlobMod.setProperty("/TotOpenVis", true);
									oGlobMod.setProperty("/TotClearVis", false);
								}
								that.getView().setModel(oModel, "openItems");
								that.getView().getModel("openItems").refresh();



								totOpen = that.currFormatC(totOpen) + " " + oGlobMod.getProperty("/Currency");
								totClear = that.currFormatC(totClear) + " " + oGlobMod.getProperty("/Currency");
								oGlobMod.setProperty("/TotalOpen", totOpen);
								oGlobMod.setProperty("/TotalCleared", totClear);


							} else {
								console.log("No Data", oData);
								oLocalModel.setProperty("/Size", 0);
								oLocalModel.setProperty("/TotOpenVis", false);
								oLocalModel.setProperty("/TotClearVis", false);
								oLocalModel.setProperty("/Address", "");
								if (undefined != that.getView().getModel("openItems")) {
									//that.getView().getModel("openItems").setData([]);
									//that.getView().getModel("openItems").refresh;
									console.log("Set No Data to Model openItems ", oData);
								}
								//SHAIKD 06Feb2025 - Set Empty Data to Model - openItems
								var oEmptyModel = new sap.ui.model.json.JSONModel();
								that.getView().setModel(oEmptyModel, "openItems");

							}


						}.bind(this),
						error: function (oError) {
							oBusyDialog.close();
							var data = JSON.stringify(oError);
							var message = $(oError.response.body).find("message").first().text();
							that.onUserMessage(message, "E");
							result = "S";
						}.bind(this)
					});
					sap.ui.core.BusyIndicator.hide();
					oView.byId("tableFooter").setVisible(true);

				},

				// Method called update the UI of Table UI control based on change in binding of rows of the table
				onChange: function (oEvent) {
					var iLength = oEvent.getSource().iLength;
					if (iLength > 10) {
						oLocalModel.setProperty("/Size", 10);
					}
					else {
						oLocalModel.setProperty("/Size", iLength);
					}

					var OpenItems = that.getView().getModel("openItems").getData();
					var aFiltered = [];
					var totOpen = 0;
					var totClear = 0;
					for (var i = 0; i < oEvent.getSource().aIndices.length; i++) {
						aFiltered.push(OpenItems[oEvent.getSource().aIndices[i]]);
					}
					//begin
					var ounique = []
					var oGlobMod = that.getView().getModel("oLocalModel");
					var rd2Sel = that.getView().byId("rbg2").getSelectedIndex();
					var rd2SelVis = that.getView().byId("rbg2").getVisible();
					for (var a = 0; a < aFiltered.length; a++) {
						var spayload = {
							"Belnr": aFiltered[a].Belnr, "Bschl": aFiltered[a].Bschl,
							"Zterm": aFiltered[a].Zterm,
							"Type": aFiltered[a].Type,
							"Wrbtr": aFiltered[a].Wrbtr
						};
						ounique.push(spayload);
					}

					var jsonObject = ounique.map(JSON.stringify);
					var uniqueSet = new Set(jsonObject);
					var uniqueArray = Array.from(uniqueSet).map(JSON.parse);

					for (var i = 0; i < uniqueArray.length; i++) {
						if (uniqueArray[i].Type == "O") {
							totOpen = totOpen + parseFloat(uniqueArray[i].Wrbtr);

						}
						else if (uniqueArray[i].Type == "C") {
							totClear = totClear + parseFloat(uniqueArray[i].Wrbtr);

						}
					}

					//end
					totOpen = totOpen.toFixed(2);
					totClear = totClear.toFixed(2);
					if (rd2SelVis) {
						oGlobMod.setProperty("/TotOpenVis", true);
						oGlobMod.setProperty("/TotClearVis", true);
					}
					else {
						oGlobMod.setProperty("/TotOpenVis", true);
						oGlobMod.setProperty("/TotClearVis", false);
					}



					totOpen = that.currFormatC(totOpen) + " " + oGlobMod.getProperty("/Currency");
					totClear = that.currFormatC(totClear) + " " + oGlobMod.getProperty("/Currency");
					oGlobMod.setProperty("/TotalOpen", totOpen);
					oGlobMod.setProperty("/TotalCleared", totClear);

					oGlobMod.refresh(true);
				},


				// Method to return true/false based on availibility of PDF for a given record in the report
				pdfExists: function (formfound) {
					if (null == formfound) {
						formfound = "";
						return "";
					}
					else if (formfound == "X") {
						return "Invoice";
					}
					else {
						return "";
					}
				},

				// Method to filter table records based on search term
				onFilter: function (oEvent, tabName) {
					var sTabName = "";
					var sQuery = "";
					if (null == oEvent) {
						sTabName = tabName
					}
					else {
						sTabName = oEvent.getSource().data("tabname");
					}

					var oBindings = null;
					var oTable = null;
					var oFilter = null;
					if ("accountSummaryTabMob" == sTabName) {
						oTable = that.getView().byId("accountSummaryTabMob");
						oBindings = oTable.getBinding("items");
					}
					else if ("accountSummaryTable" == sTabName) {
						oTable = that.getView().byId("accountSummaryTable");
						oBindings = oTable.getBinding("rows");
					}

					if (null == oEvent) {
						sQuery = "";
					}
					else {
						sQuery = oEvent.getParameter("query");
					}

					if (sQuery) {
						oFilter = new Filter([
							new Filter("Belnr", FilterOperator.Contains, sQuery),
							new Filter("Ltext", FilterOperator.Contains, sQuery),
							new Filter("Salesorder", FilterOperator.Contains, sQuery),
							new Filter("Xblnr", FilterOperator.Contains, sQuery),
							new Filter("Zuonr", FilterOperator.Contains, sQuery),
							new Filter("Zfbdt", FilterOperator.Contains, sQuery),
							new Filter("Zaldt", FilterOperator.Contains, sQuery),
							new Filter("Type", FilterOperator.Contains, sQuery),
							new Filter("ZtermText", FilterOperator.Contains, sQuery)

						], false);
					}

					oBindings.filter(oFilter, "Application");

				},

				onDatesInitialize: function () {
					var oView = this.getView();
					oView.byId("idInspectionDateTo").setDateValue(new Date());
					var today = new Date();
					var dateLimit = new Date(new Date().setDate(today.getDate() - 90));
					oView.byId("idInspectionDateFrom").setDateValue(dateLimit);
					this.isClaimsDateFrom = this.yyyymmdd(dateLimit);
					this.isClaimsDateTo = this.yyyymmdd(today);
					//this.onLoadInitClaims();
				},
				yyyymmdd: function (oNewDate) {
					var now = oNewDate;
					var y = now.getFullYear();
					var m = now.getMonth() + 1;
					var d = now.getDate();

					return '' + (m < 10 ? '0' : '')
						+ m + (d < 10 ? '/0' : '/')
						+ d + "/" + y;
				},


				yyyymmdd1: function (oNewDate) {
					var now = oNewDate;
					var y = now.getFullYear();
					var m = now.getMonth() + 1;
					var d = now.getDate();
					return '' + y + (m < 10 ? '0' : '')
						+ m + (d < 10 ? '0' : '')
						+ d;
				},
				// Method to format date field(s)
				dateFormat: function (dDate) {
					var sDate = "";
					if (null != dDate && "" != dDate) {
						var sDay = dDate.substring(6, 8);
						var sMonth = dDate.substring(4, 6);
						var sYear = dDate.substring(0, 4);
						var sDate = sMonth + "/" + sDay + "/" + sYear;
						if (sDate != "12/31/9999") {
							return sDate;
						}
					}
					else {
						return sDate;
					}
				},

				// Method to format currency field(s)
				currFormatO: function (curr, status) {
					if (null == status) {
						status = "";
					}

					if (null != curr) {
						if ("O" == status || "TO" == status) {
							return "Warning"
						}
						else if ("C" == status || "TC" == status) {
							return "Success";
						}
					}

				},


				// Method to format currency field(s)
				currFormatC: function (curr, status) {

					if (null != curr) {
						var oCurrencyFormat = NumberFormat.getCurrencyInstance();
						if (parseInt(curr) >= 0) {
							return oCurrencyFormat.format(curr, "");
						}
						else {

							curr = curr.toString().substring(1, curr.length);
							return "(" + oCurrencyFormat.format(curr, "") + ")";
						}

					}

				},

				//Method to remove leading zeroes from a number
				removeLeading: function (number) {

					if (null != number) {
						number = number.replace(/^0+/, '');
					}

					if (number == '9999999999' || number == 'ZZZZZZZZZZ') {

					}
					else {
						return number;
					}
				},

				//Method to format the status column of the account summary report
				statusFormat: function (status) {
					if ("O" == status) {
						return "Open";
					}
					else if ("C" == status) {
						return "Cleared";
						//return "Closed";
					}
					else if ("TO" == status || "TC" == status) {
						return "";
					}
				},

				// Method to display error and success messages to the user in a message toast UI control
				onUserMessage: function (uText, mType) {
					if (mType == 'E') {
						var oModel = new sap.ui.model.json.JSONModel();
						sap.ui.getCore().setModel(oModel);
						sap.ui.getCore().getModel().setProperty("/oFlag", true);
						var oFlag = sap.ui.getCore().getModel().getProperty("/oFlag");
						sap.m.MessageToast.show(
							uText,
							{
								duration: 60000,
								my: "center center",
								at: "center center"
							});
						this.onShowColor(oFlag, '#ff0000');
					} else {
						var oModel = new sap.ui.model.json.JSONModel();
						sap.ui.getCore().setModel(oModel);
						sap.ui.getCore().getModel().setProperty("/oFlag", true);
						var oFlag = sap.ui.getCore().getModel().getProperty("/oFlag");
						sap.m.MessageToast
							.show(
								uText,
								{
									duration: 60000,
									my: "center center",
									at: "center center"
								});
						this.onShowColor(oFlag, '#008000');
					}
				},
				// Method to change background color of message toast based on the type of message
				onShowColor: function (Flag, color) {
					var oContentDOM = $('#content');
					var oParent = $('#content').parent(); // Get Parent
					// Find for MessageToast class
					var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
					oMessageToastDOM.css('background', color); // Apply css
					sap.ui.getCore().getModel().setProperty("/oFlag", !Flag);
				},

				// Method to export table data in a CSV format
				onDataExport: function (oEvent) {
					debugger;
					var openItems = that.getView().getModel("openItems");

					var aDataCopy = JSON.parse(JSON.stringify(openItems.getData()));
					var modelExcel = new sap.ui.model.json.JSONModel(aDataCopy);
			
					console.log("modelExcel : /n", modelExcel);

					//openItems.getData()[0].VDate = "12/30/1921";
					var modLength = modelExcel.getData().length;	

						
					for (var i = 0; i < modLength; i++){
						//var dataObject = {};
						var docDate = modelExcel.getData()[i].Zfbdt;
						var dueDate = modelExcel.getData()[i].Zaldt;
						var varStatus = modelExcel.getData()[i].Type;
					
						modelExcel.getData()[i].Zfbdt = this.formatter.dateFormatFun(docDate).toString();
						modelExcel.getData()[i].Zaldt = this.formatter.dateFormatFun(dueDate).toString();	
						modelExcel.getData()[i].Type =  this.formatter.statusFormatFun(varStatus).toString();	
						
					}
					var oExport = new Export({
						exportType: new ExportTypeCSV({ separatorChar: "," 	}),
						// Pass in the model created above
						models: modelExcel,
						// binding information for the rows aggregation
						rows: { path: "/" 	},

						// column definitions with column name and binding info for the content
						/*
							{
								name: "Bas #",
								template: { content: "{Bschl}"  }
							},
						*/

						columns: [
							{
								name: "DocumentNumber",
								template: {  	content: "{Belnr}"   }
							},							
							{
								name: "DocumentType",
								template: {
									content: "{Ltext}"
								}
							},
							{
								name: "OrderNumber",
								template: {
									content: "{Salesorder}"
								}
							},
							{
								name: "ReferenceNumber",
								template: {
									content: "{Xblnr}"
								}
							},
							{
								name: "AssignmentNumber",
								template: {
									content: "{Zuonr}"
								}
							},
							{
								name: "DocumentDate",
								template: {
									content: "{Zfbdt}"
								}
							},
							{
								name: "Due Date",
								template: {
									content: "{Zaldt}"
								}
							},		
							{
								name: "Status",
								template: {
									content: "{Type}"									
								}
							},					
							{
								name: "Terms",
								template: {
									content: "{ZtermText}"
								}
							},
							{
								name: "Amount",
								template: {
									content: "{Wrbtr}"
								}
							}
							
						]
					});

					var newDate = new Date();
					var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "yyyyMMdd"
					});
					var subFromDate = oDateFormat.format(newDate);
					var oTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "HHmmss"
					});
					var subFromTime = oTimeFormat.format(newDate);
					var custnum = oLocalModel.getProperty("/CustNum");
					var fileName = "Account_Summary_" + custnum + "_" + subFromDate + "_" + subFromTime;

					oExport.saveFile(fileName).catch(function (oError) {
						MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
					}).then(function () {
						oExport.destroy();
					});
				},

				createExcelColumnConfig: function() {
			
					const aCols = [];
				
						aCols.push({
							label: "Doc #",
							property: "Belnr",
							type: EdmType.Number,
							scale:0 
						});
			
						aCols.push({
							label: "Doc. Type",
							property: "Ltext",
							type: EdmType.String
						});
			
						aCols.push({
							label: "Order #",
							property: "Salesorder",
							type: EdmType.Number
						});
						aCols.push({
							label: "Ref #",
							property: "Xblnr",
							type: EdmType.String
						});
						aCols.push({
							label: "Assignment #",
							property: "Zuonr",
							type: EdmType.String
						});
						aCols.push({
							label: "Doc. Date",
							property: "Zfbdt",
							type: EdmType.String
						});
						aCols.push({
							label: "Due Date",
							property: "Zaldt",
							type: EdmType.String
						});
			
						aCols.push({
							label: "Status",
							property: "Type",
							type: EdmType.String
						});
						aCols.push({
							label: "Terms",
							property: "ZtermText",
							type: EdmType.String
						});
						aCols.push({
							label: "Amount",
							property: "Wrbtr",
							type: EdmType.String
						});
									
						return aCols;
					},

				onExcelExport: function(oEvent) {
					//SHAIKD New Method - 06Feb2025
					debugger;
					var blnExcelNOData = false;					
					var openItemsMod = that.getView().getModel("openItems");

					if(openItemsMod){	
					var aDataCopy = JSON.parse(JSON.stringify(openItemsMod.getData()));
					var modelExcel = new sap.ui.model.json.JSONModel(aDataCopy);
			
					console.log("modelExcel : /n", modelExcel);

					var modLength = modelExcel.getData().length;	
						
					for (var i = 0; i < modLength; i++){

						var docDate = modelExcel.getData()[i].Zfbdt;
						var dueDate = modelExcel.getData()[i].Zaldt;
						var varStatus = modelExcel.getData()[i].Type;
					
						modelExcel.getData()[i].Zfbdt = this.formatter.dateFormatFun(docDate).toString();
						modelExcel.getData()[i].Zaldt = this.formatter.dateFormatFun(dueDate).toString();	
						modelExcel.getData()[i].Type =  this.formatter.statusFormatFun(varStatus).toString();	
						
					}
					
					//var fileName1 = "AccountSummary"
					var accSummModelData = modelExcel.getData();

					var newDate = new Date();
					var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "yyyyMMdd"
					});
					var subFromDate = oDateFormat.format(newDate);
					var oTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "HHmmss"
					});
					var subFromTime = oTimeFormat.format(newDate);
					var custnum = oLocalModel.getProperty("/CustNum");
					var fileName1 = "Account_Summary_" + custnum + "_" + subFromDate + "_" + subFromTime;

					if(modLength>0){
						const aCols = this.createExcelColumnConfig();
						const oSettings = {
							workbook: {
								columns: aCols,
								hierarchyLevel: "Level",
								sheetName: "Account Summary Report"
							},
							dataSource: accSummModelData,
							fileName: fileName1,
							worker: false // We need to disable worker because we are using a MockServer as OData Service
						};	
						const oSheet = new Spreadsheet(oSettings);
						oSheet.build().finally(function() {
							oSheet.destroy();
						});
					}
					else{
						blnExcelNOData = true;
					}
				}
				else{
					blnExcelNOData = true;
				}
				if(blnExcelNOData){
					MessageBox.error("Excel export is not possible because no data to export.");
				}
				}// End of onExcelExport()	

			});
		return CController;
	});

	/*
 "resources": {
            "css": [
                {
                    "uri": "/sap/bc/ui5_ui5/sap/zsharpcss/css/style.css"
                },          
                {
                    "uri": "https://port8081-workspaces-ws-qmzzf.us21.applicationstudio.cloud.sap/css/style.css"
                }
                    
            ]
        },

	*/
