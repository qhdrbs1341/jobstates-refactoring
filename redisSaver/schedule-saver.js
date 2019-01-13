require('dotenv').config();
const redis = require('redis');
//const redisPool = require('../redisConnection/pool').redisPool();
const {User,Company,Hire,Schedule,HireTech,Category,HireComment} = require('../models/index');
exports.scheduleSaver = async(userId) => {
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
        const exSchedule = await Schedule.findAll({where: {userId: userId},
            include: [{model: Hire, 
                include: 
                [{model: Company, include: {model: Category}},{model: HireTech}]},{model: HireComment}]});
            
            const dataArray = exSchedule.map(schedule => {
                const data = { 
                    scheduleId: schedule.id,
                    status: schedule.status,
                    statusDate: schedule.statusDate,
                    hireId: schedule.hireId,
                    title: schedule.hire.title,
                    importantInfo: schedule.hire.importantInfo,
                    detailInfo: schedule.hire.detailInfo,
                    hireImage: schedule.hire.hireImage,
                    address: schedule.hire.address,
                    experience: schedule.hire.experience,
                    salary: schedule.hire.salary,
                    deadLine: schedule.hire.deadLine,
                    provider: schedule.hire.provider,
                    hireUrl: schedule.hire.hireUrl,
                    end: schedule.hire.end,
                    companyId: schedule.hire.companyId,
                    brand: schedule.hire.company.brand,
                    logo: schedule.hire.company.logo,
                    companyUrl: schedule.hire.company.companyUrl,
                    intro: schedule.hire.company.intro,
                    category: schedule.hire.company.categories.map(category => category.title),
                    hireTech: schedule.hire.hireTeches.map(hireTech => hireTech.title),
                    commentId: schedule.hireComment.id,
                    advantage: schedule.hireComment.advantage,
                    disAdvantage: schedule.hireComment.disAdvantage,
                    strategy: schedule.hireComment.strategy
                }
                return data;
            })
            await client.hmset(userId,'schedule',JSON.stringify(dataArray));
            return dataArray;
    }catch(err){
        console.log(err);
    }
}
