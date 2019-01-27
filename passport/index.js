const kakao = require('./kakaoStrategy');
const google = require('./googleStrategy');
const github = require('./githubStrategy');
const jwt = require('./jwt');
module.exports=(passport)=>{
    kakao(passport);
    google(passport);
    github(passport);
    jwt(passport);
}
