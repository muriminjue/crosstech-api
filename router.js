// import modules
const express = require("express");
const router = express.Router();

//files
const controllers = require("./app/controllers");
const { deliveryreport } = require("./app/services/sms");
const access = require("./app/services/userroles")
const checkauth= controllers.user.checkauth

//routes

//---special--
router.post("/sms-delivery", deliveryreport);

//---staff--
router.get("/staff", /*checkauth,*/ controllers.staff.getall);
router.get("/staff/:email", /*checkauth,*/ controllers.staff.getone);
router.post("/staff", /*checkauth,*/ controllers.staff.addone);
router.put("/staff/:email", /*checkauth,*/ controllers.staff.editone);
router.delete("/staff/:email", /*checkauth,*/ controllers.staff.deleteone);

//---user--
router.post("/user", /*checkauth,*/ controllers.user.adduser);
router.delete("/user/:username", /*checkauth,*/ controllers.user.deleteuser);
router.put("/user/:username", controllers.user.otpchangepass);
router.put("/user/newpassword/:username", checkauth, controllers.user.updatepass);
router.post("/login", controllers.user.login);
router.post("/sendotp", controllers.user.sendotp);
router.get("/allroles", /*checkauth,*/ controllers.user.getroles);
router.put("/updateimage/:username",checkauth, controllers.user.updateimage)
router.put("/changeuserroles/:username", /*checkauth,*/ controllers.user.changeUseroles)

//-- product--
router.post("/product", /*checkauth,*/ controllers.product.addnew);
router.get("/product", /*checkauth,*/ controllers.product.getall);
router.get("/product/:id", /*checkauth,*/ controllers.product.getone);
router.get("/productdetailed", /*checkauth,*/ controllers.product.getalldetailed);
router.get("/productdetailed/:id", /*checkauth,*/ controllers.product.getonedetailed);
router.put("/product/:id", /*checkauth,*/ controllers.product.update);

//--- package --
router.post("/package", /*checkauth,*/ controllers.package.addnew);
router.get("/package", /*checkauth,*/ controllers.package.getall);
router.get("/package/:id", /*checkauth,*/ controllers.package.getone);
router.get("/packagedetailed", /*checkauth,*/ controllers.package.getalldetailed);
router.get("/packagedetailed/:id", /*checkauth,*/ controllers.package.getonedetailed);
router.put("/package/:id", /*checkauth,*/ controllers.package.editone);

// -- Busines partners
router.get("/bp/customers",/*checkauth,*/ controllers.customers.getall)
router.post("/bp/customers",/*checkauth,*/ controllers.customers.addone)
router.put("/bp/customers/:id",/*checkauth,*/ controllers.customers.editone)
router.delete("/bp/customers/:id",/*checkauth,*/ controllers.customers.deleteone)
router.get("/bp/customersdetailed",/*checkauth,*/ controllers.customers.getalldetailed)
router.get("/bp/customers/:id",/*checkauth,*/ controllers.customers.getone)
router.get("/bp/retailer/:id",/*checkauth,*/ controllers.retailers.getone)
router.get("/bp/retailer",/*checkauth,*/ controllers.retailers.getall)
router.post("/bp/retailer", /*checkauth,*/ controllers.retailers.addone)
router.get("/bp/retailerdetailed", /*checkauth,*/ controllers.retailers.getalldetailed)
router.put("/bp/retailer/:id", /*checkauth,*/ controllers.retailers.editone)
router.delete("/bp/retailer/:id", /*checkauth,*/ controllers.retailers.deleteone)
router.get("/bp/suppliers",/*checkauth,*/ controllers.suppliers.getall)
router.post("/bp/suppliers",/*checkauth,*/ controllers.suppliers.addone)
router.put("/bp/suppliers/:id",/*checkauth,*/ controllers.suppliers.editone)
router.delete("/bp/suppliers/:id",/*checkauth,*/ controllers.suppliers.deleteone)
router.get("/bp/suppliersdetailed",/*checkauth,*/ controllers.suppliers.getalldetailed)
router.get("/bp/suppliers/:id",/*checkauth,*/ controllers.suppliers.getone)

//-- stock --
// purchaseprod,
// updatestocking,
// uploadStockreceipt,
// deletestocking,
// getallstockingdetailed,
// getonestocking,
// getallstocking,
// packageproduct,
// deletepackaging,
// getallpackaging,
// getonepackaging,
// addotherstockitem,
// purchaseotherstock,
// updateotherstocking,
// uploadOtherstockreceipt,
// deleteotherstocking,
// getoneotherstocking,
// getallotherstockingdetailed,
// assignstock,
// undoassignstock,
// getassignedstock,

module.exports = router;

