const facebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();
const {User} = require('../models/index');

module.exports = (passport)=>{
    passport.use(new facebookStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: '/auth/facebook/callback'
    },async(accessToken, refreshToken, profile, done)=>{
        try{
            const exUser = await User.find({where: {snsId: profile._json.id, provider: 'facebook'}});
            if(exUser){
                done(null,exUser);
            }else{
                const newUser = await User.create({
                    snsId: profile._json.id,
                    nick: profile._json.name,
                    provider: 'facebook'
                })
            }
        }catch(err){
            console.log(err);
            done(err);
        }
    }))
}
