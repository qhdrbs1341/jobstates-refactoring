require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const hpp = require('hpp');
const http = require('http');
const redis = require('redis');
const requestIp = require('request-ip');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  no_ready_check: true,
  auth_pass: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT
});

const redisPub = redis.createClient({
  host: process.env.REDIS_HOST,
  no_ready_check: true,
  auth_pass: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT
});


app.set('port', 3000);
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet());
  app.use(hpp());
} else {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser(process.env.COOKIE_SECRET))
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false
  }
}

if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
  sessionOption.cookie.secure = true;
}

app.use(session(sessionOption))

app.post('/',async (req,res,next)=>{
  try{
  const {key,uri,port} = req.body;
  const url = await requestIp.getClientIp(req);
  await client.hset(uri,key,JSON.stringify({url,port}));
  res.json("Save New Service on Redis Success");
  redisPub.publish('services',JSON.stringify({url,port,key,uri}));
  }catch(err){
    console.log("Add Service Error");
    console.log(err);
    next(err);
  }
})

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
})

app.use((err, req, res) => {
  res.json({
    code: err.status || 500,
    message: err.message
  })
})

const httpServer = http.createServer(app);
httpServer.listen(app.get('port'))
.on('connect', ()=> { console.log(`Distributor Connect`)})
.on('close', () => { 
  console.log('Distributor Closed')
})

module.exports = app;
