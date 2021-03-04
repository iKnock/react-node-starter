const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util')//we used this to promisify, which takes any function that has callback and change it to promise

const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
client.get = util.promisify(client.get);//we overwrite the exiting client.get with the promisified version


//store reference to the original mongoose exec function (untoched copy of it)
const exec = mongoose.Query.prototype.exec;

//we add our logic in to the original function
//notice the use of function key word not the arrow function. which is because we need
//to use this key word, this in this case refer to Query object
mongoose.Query.prototype.exec = async function () {
    //this is used to safely copy properties from one object to the other and stringified to use for redis
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    //See if we have a value for 'key' in redis

    const cacheValue = await client.get(key);

    //If yes do return the cachedValue
    //the exec function must always return a mongoose document (Model instances)
    if (cacheValue) {
        const doc = new this.model(JSON.parse(cacheValue))
        return doc;
    }

    //otherwise, issue the query and store the result in redis
    //this is to run the original exec function, we use apply to pass in automatically any arguments that are passed to exec as well
    const result = await exec.apply(this, arguments);

    //since redis only accept string make sure to stringify it before
    client.set(key, JSON.stringify(result));

    //the exec function must always return a promis of mongoose document
    return result;
}