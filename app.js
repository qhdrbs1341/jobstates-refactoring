const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const flash = require('connect-flash');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const {sequelize} = require('./models/index');
const passport = require('passport');
const passportConfig = require('./passport/index');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const scheduleRouter = require('./routes/schedule');

require('dotenv').config();
app.set('port',process.env.PORT);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false
    }
  })
)
app.use(flash());
sequelize.sync();

app.use('/auth',authRouter);
app.use('/user',userRouter);
app.use('/schedule',scheduleRouter);

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.render('error')
  console.log(err);
})

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')} 포트에서 서버 실행`)
})
