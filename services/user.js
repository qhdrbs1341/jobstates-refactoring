   require('dotenv').config();
   const express = require('express');
   const app = express();
   const path = require('path');
   const morgan = require('morgan');
   const cors = require('cors');
   const cookieParser = require('cookie-parser');
   const session = require('express-session');
   const {
     sequelize
   } = require('../models/index');
   const passport = require('passport');
   const passportConfig = require('../passport/index');
   const helmet = require('helmet');
   const hpp = require('hpp');
   const authRouter = require('../routes/auth');
   const userRouter = require('../routes/user');
   const http = require('http');
   const {
     verifyToken,
   } = require('../routes/middlewares');
   passportConfig(passport);

   app.set('port', process.env.PORT);
   app.use(cors());

   const serviceRegister = require('../helpers/service_register');
   serviceRegister.regist('/user', app);
   require('../factories/user_tcp_server')(app);
   
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
   sequelize.sync();

   app.use('/', verifyToken, userRouter);

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
   httpServer.listen(app.get('port'),(port)=>{
    console.log("User Service Http Listen on ",app.get('port'));
   })

   module.exports = app;
// setTimeout(()=>{process.exit()},100000);
