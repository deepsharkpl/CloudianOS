const { getCurrentDate } = require("../utils/system/getCurrentDate");
const { getTime24 } = require("../utils/system/getTime");

const express = require("express");
const router = express.Router();

router.get("/time", (req, res) => {
    res.json({
        time: getTime24(),
        date: getCurrentDate(),
    });
});

module.exports = router;