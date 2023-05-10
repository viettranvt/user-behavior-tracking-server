const express = require("express");
const app = express();
const config = require("config");
const db = require("./database/db");

const getStatisticUserByDay = require("./schedule-jobs/get-statistic-user-by-day");
const getStatisticUserByWeek = require("./schedule-jobs/get-statistic-user-by-week");
const autoBackupDB = require("./schedule-jobs/backupDB");

// config log4js
const log4js = require("log4js");
//log4js.configure('./config/log4js.json');

db(() => {
  console.log("Connect to mongodb successfully");
  const port = config.get("appScheduleJobs").port;
  app.listen(port, (err) => {
    if (err) return console.error(err);

    console.log(`Server is listening on port ${port}`);

    getStatisticUserByDay();
    getStatisticUserByWeek();
    autoBackupDB();
  });
});
