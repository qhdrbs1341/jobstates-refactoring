require('dotenv').config()
const redis = require('redis');

exports.profileRead = async (req,res,next) => {
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
        // const exist = await client.exists(req.body.id)
        // console.log("존재여부!!!!!",exist)
        await client.hgetall(req.body.id, (err,obj)=>{
            if(!obj.profile){
                next();
            }else if(err){
                next(err);
            }
            else{
                res.json(JSON.parse(obj.profile))
            }
        })
    }catch(err){
        next(err);
    }
}

exports.scheduleRead = async(req,res,next)=>{
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
        await client.hgetall(req.body.id, (err,obj)=>{
            if(!obj.schedule){
                next();
            }else if(err){
                next(err);
            }
            else{
                res.json(JSON.parse(obj.schedule));
            }
        })
    }catch(err){
        next(err);
    }
}
