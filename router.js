// import modules
const express = require("express");
const router = express.Router();

//files
const controllers = require("./app/controllers");
const { deliveryreport } = require("./app/services/sms");
const {isadmin, isaccounts, issystemadmin, isstock, issales} = require("./app/services/userroles")
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
router.post("/product", checkauth, controllers.product.addnew);
router.get("/product", checkauth, controllers.product.getall);
router.get("/product/:id", checkauth, controllers.product.getone);
router.get("/productdetailed", checkauth, controllers.product.getalldetailed);
router.get("/productdetailed/:id", checkauth, controllers.product.getonedetailed);
router.put("/product/:id", checkauth, controllers.product.update);

//--- package --
router.post("/package", checkauth, controllers.package.addnew);
router.get("/package", checkauth, controllers.package.getall);
router.get("/package/:id", checkauth, controllers.package.getone);
router.get("/packagedetailed", checkauth, controllers.package.getalldetailed);
router.get("/packagedetailed/:id", checkauth, controllers.package.getonedetailed);
router.put("/package/:id", checkauth, controllers.package.editone);

// --- otherstock
router.post("/otherstock", checkauth, controllers.otherstock.addnew)
router.put("/otherstock/:id", checkauth, controllers.otherstock.editone)
router.get("/otherstock", checkauth, controllers.otherstock.getall)
router.get("/otherstockdetailed", checkauth, controllers.otherstock.getalldetailed)
router.get("/otherstock/:id", checkauth, controllers.otherstock.getone)
router.get("/otherstock/package/:id", checkauth, controllers.otherstock.getallpackage)

// -- Busines partners
router.get("/bp/customers",checkauth, controllers.customers.getall)
router.post("/bp/customers",checkauth, controllers.customers.addone)
router.put("/bp/customers/:id",checkauth, controllers.customers.editone)
router.delete("/bp/customers/:id",checkauth, controllers.customers.deleteone)
router.get("/bp/customersdetailed",checkauth, controllers.customers.getalldetailed)
router.get("/bp/customers/:id",checkauth, controllers.customers.getone)
router.get("/bp/retailer/:id",checkauth, controllers.retailers.getone)
router.get("/bp/retailer",checkauth, controllers.retailers.getall)
router.post("/bp/retailer", checkauth, controllers.retailers.addone)
router.get("/bp/retailerdetailed", checkauth, controllers.retailers.getalldetailed)
router.put("/bp/retailer/:id", checkauth, controllers.retailers.editone)
router.delete("/bp/retailer/:id", checkauth, controllers.retailers.deleteone)
router.get("/bp/suppliers",checkauth, controllers.suppliers.getall)
router.post("/bp/suppliers",checkauth, controllers.suppliers.addone)
router.put("/bp/suppliers/:id",checkauth, controllers.suppliers.editone)
router.delete("/bp/suppliers/:id",checkauth, controllers.suppliers.deleteone)
router.get("/bp/suppliersdetailed",checkauth, controllers.suppliers.getalldetailed)
router.get("/bp/suppliers/:id",checkauth, controllers.suppliers.getone)

//-- stock --
router.post("/stock/purchase", checkauth, controllers.stocking.purchaseprod)
router.put("/stock/purchase/:id", checkauth, controllers.stocking.updatestocking)
router.post("/stock/purchasereceipt/:id", checkauth, controllers.stocking.uploadStockreceipt)
router.delete("/stock/purchase/:id", checkauth, controllers.stocking.deletestocking)
router.get("/stock/purchasedetailed", checkauth, controllers.stocking.getallstockingdetailed)
router.get("/stock/purchase/:id", checkauth, controllers.stocking.getonestocking)
router.get("/stock/purchase", checkauth, controllers.stocking.getallstocking)
router.post("/stock/package",checkauth, controllers.stocking.packageproduct)
router.delete("/stock/package/:id",checkauth, controllers.stocking.deletepackaging)
router.get("/stock/package",checkauth, controllers.stocking.getallpackaging)
router.get("/stock/package/:id",checkauth, controllers.stocking.getonepackaging)//
router.post("/stock/other/purchase", checkauth, controllers.stocking.purchaseotherstock)
router.put("/stock/other/purchase/:id", checkauth, controllers.stocking.updateotherstocking)
router.post("/stock/other/receipt/:id", checkauth, controllers.stocking.uploadOtherstockreceipt)
router.delete("/stock/other/purchase/:id", checkauth, controllers.stocking.deleteotherstocking)
router.get("/stock/other/purchase/:id", checkauth, controllers.stocking.getoneotherstocking)
router.get("/stock/other/purchase", checkauth, controllers.stocking.getallotherstocking)
router.get("/stock/other/purchasedetailed", checkauth, controllers.stocking.getallotherstockingdetailed)
router.post("/stock/assign", checkauth, controllers.stocking.assignstock)
router.put("/stock/assign/:id", checkauth, controllers.stocking.undoassignstock)
router.get("/stock/assign", checkauth, controllers.stocking.getassignedstock)
router.get("/stock/assign/:id", checkauth, controllers.stocking.getuserassignedstock)

module.exports = router;

