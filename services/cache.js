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
mongoose.Query.prototype.exec = function () {
    console.log('Im about to RUN a QUERY');
    //this is used to safely copy properties from one object to the other and stringified to use for redis
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    //See if we have a value for 'key' in redis

    const cacheValue = await client.get(key);

    //If we do return that 


    //otherwise, issue the query and store the result in redis

    console.log(key);

    //this is to run the original exec function, we use apply to pass in automatically any arguments that are passed to exec as well
    return exec.apply(this, arguments);
}



/**
 *
    //Do we have any cached data in redis related to this query
    //if yes, respond to  the request right away
    if (cachedBlogs) {
      console.log('SERVING FROM CACHE')
      return res.send(JSON.parse(cachedBlogs))
    }
    //if no read from mongodb respond request
    const blogs = await Blog.find({ _user: req.user.id });
    console.log('SERVING FROM MONGDB')
    res.send(blogs);
    //and update cache
    client.set(req.user.id, JSON.stringify(blogs));

    //for deleting all entries in redis use the following command
    //client.flushall()
 *
 *
 */