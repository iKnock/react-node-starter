const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util')//we used this to promisify, which takes any function that has callback and change it to promise

const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
client.hget = util.promisify(client.hget);//we overwrite the exiting client.get with the promisified version


//store reference to the original mongoose exec function (untoched copy of it)
const exec = mongoose.Query.prototype.exec;

//This is to create toggleable cache for every query, so every query inherit this method, so if this 
//method is called on a query then that query is going to be cached
mongoose.Query.prototype.cache = function (options = {}) {
    //this key word make the useCache property available for Query instance like exec in this case
    //so that we can refer this.useCache down in the exec method
    this.useCache = true;

    this.hashKey = JSON.stringify(options.key || '');//to create the top level key in nested cache on the fly passed by the user    
    return this;//this makes the function cache channable
}

//we add our logic in to the original function
//notice the use of function key word not the arrow function. which is because we need
//to use this key word, this in this case refer to Query object
mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        //if this.useCache is false skip the cache logic
        return exec.apply(this, arguments);
    }

    //this is used to safely copy properties from one object to the other and stringified 
    //to use for redis
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    //See if we have a value for 'key' in redis
    const cacheValue = await client.hget(this.hashKey, key);

    //If yes do return the cachedValue
    //the exec function must always return a mongoose document (Model instances)
    if (cacheValue) {
        //new this.model(JSON.parse(cacheValue)) this always expect json object. so to handle an array of json object we have to do 
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    //otherwise, issue the query and store the result in redis
    //this is to run the original exec function, we use apply to pass in automatically any arguments that are passed to exec as well
    const result = await exec.apply(this, arguments);

    //since redis only accept string make sure to stringify it before adding to redis cache
    //redis also accept expiration duration to automatically remove the value from the cache    
    client.hset(this.hashKey, key, JSON.stringify(result));

    //the exec function must always return a promis of mongoose document
    return result;
}

module.exports = {
    clearHash(hashKey) {
        console.log('HASHKEY=========>' + hashKey)
        client.del(JSON.stringify(hashKey));
    }
}