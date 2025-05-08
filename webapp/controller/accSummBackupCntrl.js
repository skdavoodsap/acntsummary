function onGetUserDetailsZZZ(userid) {
    var t = this;

    var serviceUrl = "/sap/opu/odata/SAP/ZSD_USERREF_SRV";

    this.oData = new sap.ui.model.odata.ODataModel(serviceUrl, false, "MOBILEF1", "Zsq123a");

    var vPath = "UserReferencesSet?$filter=User eq '" + userid + "'";

    var userID = null;

    this.oData.read(vPath,
        {
            async: true,
            success: function (oData) {

                // var oModel = new sap.ui.model.json.JSONModel();
                // oModel.setData(oData);

                // if (oData.results.length > 0) {
                // 	t.userType = oData.results[0].ItUser;

                // 	if (t.userType != "X") {

                // 		for (i = 0; oData.results.length > i; i++) {

                // 			if (oData.results[i].EtUserRefs.ObjType == "ZWWKUNNR") {

                // 				t.userCustomerNumList.userCustomerNumList
                // 						.push({
                // 							CustomerNum : oData.results[i].EtUserRefs.ObjKey
                // 									.replace(
                // 											/^0+/,
                // 											''),
                // 							CustomerName : oData.results[i].EtUserRefs.ObjKey
                // 									.replace(
                // 											/^0+/,
                // 											'')
                // 						})

                // 			}
                // 		}

                // 		if (t.userCustomerNumList.userCustomerNumList.length > 1) {
                // 			t
                // 					.onCustomerNumDialog();
                // 		} else {
                // 			t.userCustomerNum = oData.results[0].EtUserRefs.ObjKey
                // 					.replace(
                // 							/^0+/,
                // 							'');



                // 		}
                // 	}


                // } else {
                // 	alert("error 730");
                // }




                var oGlobMod = oView.getModel("oLocalModel");
                if (oData.results.length == 1) {
                    //Single Customer
                    oGlobMod.setProperty("/isInternal", true);
                    //SHAIKD Below Line Commented
                    //oView.byId("dealerinfo").setVisible(true);
                    oView.byId("dealerid").setText(oData.results[0].CustList.Customerno);
                    oView.byId("dealername").setText(oData.results[0].CustList.Name);
                    oView.byId("CustNum").setVisible(false);
                    oView.byId("CustNumInp").setVisible(false);
                    oView.byId("CustDrp").setVisible(false);
                    // oView.byId("CustomerTextInputTo").setWidth('21rem');
                    // oView.byId("CustomerTextInputTo").addStyleClass("CustDrp");
                    oView.byId("CustNumInp").setValue(oData.results[1].CustList.Customerno);
                    oGlobMod.setProperty("/CustNum", oData.results[1].CustList.Customerno);
                }
                else if (oData.results.length > 1) {
                    oGlobMod.setProperty("/isInternal", true);
                    var aCustomers = [];
                    for (var i = 0; i < oData.results.length; i++) {
                        aCustomers.push({
                            "Customerno": oData.results[i].CustList.Customerno.replace(/^0+/, ''),
                            "Name": oData.results[i].CustList.Name
                        });
                    }
                    oView.byId("CustDrp").setVisible(true);
                    oView.byId("dealerinfo").setVisible(false);
                    oView.byId("CustNumInp").setVisible(false);
                    oView.byId("CustNum").setVisible(false);

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
                var message = $(oError.response.body).find("message").first().text();

                sap.m.MessageToast.show(message);

            }
        });
    return userID;
}