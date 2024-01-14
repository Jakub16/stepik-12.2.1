const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

recordRoutes.route("/products").get(function(req,res) {
    const sortDirection = req.query.sortDirection | 1;
    const sortColumn = req.query.sortColumn | "name";

    let db_connect = dbo.getDb();
    db_connect.collection("products")
        .sort({ [sortColumn] : [sortDirection] })
        .toArray(function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

recordRoutes.route("/products").post(function(req, res) {
    let db_connect = dbo.getDb();
    const nameFromReq = req.body.name;

    const obj = {
        name: nameFromReq,
        price: req.body.price,
        description: req.body.description,
        quantity: req.body.quantity,
        unit: req.body.unit
    };

    db_connect.collection("products").findOne({name: nameFromReq}, function (err, result) {
        if (result) res.status(400)
            .send({
                message: "Pole name musi być unikalne."
            });
        else {
            db_connect.collection("products").insertOne(obj, function (err, result) {
                if (err) throw err;
                res.json(result);
            });
        }
    });
});

recordRoutes.route("/products/:id").put(function (req, res) {
    let db_connect = dbo.getDb();

    let newObj = {};

    if (req.body.name) newObj.name = req.body.name;
    if (req.body.price) newObj.price = req.body.price;
    if (req.body.description) newObj.description = req.body.description;
    if (req.body.quantity) newObj.quantity = req.body.quantity;
    if (req.body.unit) newObj.unit = req.body.unit;

    db_connect.collection("products").updateOne(
        {_id: ObjectId(req.params.id)},
        {$set: newObj},
        function (err, result) {
            if (err) throw err;
            res.json(result)
        });
});

recordRoutes.route("/products/:id").delete(function (req, res) {
    let db_connect = dbo.getDb();
    let query = {_id: ObjectId(req.params.id)};

    db_connect.collection("products").findOne(query, function (err, result) {
        if (!result) res.status(400)
            .send({
                message: "Nie znaleziono produktu o podanym id."
            });
        else {
            db_connect.collection("products").deleteOne(query, function (err, result) {
                if (err) {
                    res.status(404)
                        .send({
                            message: err
                        })
                }
                res.json(result);
            });
        }
    });

});

recordRoutes.route("/products/:id").get(function (req, res) {
    let db_connect = dbo.getDb();
    let query = {_id: ObjectId(req.params.id)};

    let finalResult = db_connect.collection("products").aggregate(
        [
            { $match: [query] },
            { $project: { name: 1, total: { $multiply: [ "$price", "$quantity" ] } } }
        ])

    res.json(finalResult);
})

module.exports = recordRoutes;