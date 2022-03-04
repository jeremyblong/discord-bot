const axios = require("axios");
const config = require("config");
const { Connection } = require("../mongoUtil.js");
const cron = require('node-cron');

// async/await error catcher
const catchAsyncErrors = fn => (
    (req, res, next) => {
      const routePromise = fn(req, res, next);
      if (routePromise.catch) {
        routePromise.catch(err => next(err));
      }
    }
);

const intervalHelper = (client, interval) => {
	
	if (Connection.db !== null) {

    // cronJob();

		console.log("Database is now confirmed & connected properly with delay!");

    const { user } = client;
    
    const configuration = {
      params: {
        user
      }
    }
    const dbConfig = config.get('baseURLServer');

    axios.get(`${dbConfig}/get/user/info/save`, configuration).then((res) => {
      if (res.data.message === "Successfully saved user data!") {
        console.log("SUCCESSFULLY SAVED USER...:", res.data);

        clearTimeout(interval);
      } else {
        console.log("Err", res.data);

        clearTimeout(interval);
      }
    }).catch((err) => {
      console.log("Critical err:", err);

      clearTimeout(interval);
    })
	}
}
const cronJob = () => {
  // update and check for things in user account that should be updated
  cron.schedule('*/10 * * * * *', () => {
    console.log('running a task every hour...!');

    // check for changes with specific user
    axios.get(`${config.get("baseURLServer")}/check/account/frozen/all`, {
      params: {

      }
    }).then((res) => {
      console.log(res.data);
    }).catch((err) => {
      console.log(err);
    })
    // insert api call here eventually..
  });
}
module.exports = {
  cronJob,
  catchAsyncErrors,
  intervalHelper
};