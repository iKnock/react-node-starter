jest.setTimeout(30000);//wait 30 seconds before failing any test. which the default was 5 sec

require('../models/User');

const mongoose = require('mongoose')
const keys = require('../config/keys')

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })