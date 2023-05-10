const schedule = require("node-schedule");
const log4js = require("log4js");
const logger = log4js.getLogger("Tasks");
const config = require("config");
const fs = require("fs");
const exec = require("child_process").exec;

const BackupDBTime = config.get("appScheduleJobs").backupDBTime;
const dbOptions = config.get("mongo");

/* return date object */
const stringToDate = (dateString) => {
  logger.info("scheduleJobs::stringToDate::is called");
  try {
    logger.info("scheduleJobs::stringToDate::success");
    return new Date(dateString);
  } catch (e) {
    logger.error("scheduleJobs::stringToDate::error", e);
    throw new Error(e);
  }
};

// Auto backup script
const dbAutoBackUp = () => {
  logger.info("scheduleJobs::dbAutoBackUp::is called");
  try {
    // check for auto backup is enabled or disabled
    if (dbOptions.autoBackup) {
      const date = new Date();
      currentDate = stringToDate(date); // Current date
      const newBackupDir =
        currentDate.getFullYear() +
        "-" +
        (currentDate.getMonth() + 1) +
        "-" +
        currentDate.getDate();
      const newBackupPath =
        dbOptions.autoBackupPath + "mongodump-" + newBackupDir; // New backup path for current backup process

      // check for remove old backup after keeping # of days given in configuration
      if (dbOptions.removeOldBackup == true) {
        if (fs.existsSync(dbOptions.autoBackupPath)) {
          logger.info("scheduleJobs::dbAutoBackUp::remove old backup dir");
          exec("rm -rf " + dbOptions.autoBackupPath, (err) => {
            if (err) {
              logger.error(
                "scheduleJobs::dbAutoBackUp::remove old backup err",
                err
              );
              return;
            }
          });
        }
      }

      const cmd = `mongodump --authenticationDatabase admin --username ${dbOptions.user} --password ${dbOptions.password} -d ${dbOptions.database} -h ${dbOptions.host} --out ${newBackupPath}`; // Command for mongodb dump process

      logger.info("scheduleJobs::dbAutoBackUp::backing up...");
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error("scheduleJobs::dbAutoBackUp::can't backup db", error);
          return;
        }

        logger.info("scheduleJobs::dbAutoBackUp::success");
        return;
      });
    }
  } catch (e) {
    logger.error("scheduleJobs::dbAutoBackUp::error", e);
    throw new Error(e);
  }
};

module.exports = () => {
  schedule.scheduleJob(BackupDBTime, () => {
    logger.info("scheduleJobs::backupDB::is called");
    try {
      dbAutoBackUp();
    } catch (e) {
      logger.error("scheduleJobs::backupDB::error", e);
      console.error(JSON.stringify(e));
      return;
    }
  });
};
