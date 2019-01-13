const express = require('express');
const router = express.Router();
const {User,Company,Hire,Schedule,HireTech,Category,HireComment} = require('../models/index');
const Op = require('sequelize').Op;
const {scheduleRead} = require('../middleware/redis-check');
const {scheduleSaver} = require('../redisSaver/schedule-saver');

//유저의 스케쥴 정보 모두 검색
router.get('/',scheduleRead,async (req,res,next)=>{
    try{
        // const exSchedule = await Schedule.findAll({where: {userId: req.body.id},
        // include: [{model: Hire, 
        //     include: 
        //     [{model: Company, include: {model: Category}},{model: HireTech}]},{model: HireComment}]});
        
        // const dataArray = exSchedule.map(schedule => {
        //     const data = { 
        //         scheduleId: schedule.id,
        //         status: schedule.status,
        //         statusDate: schedule.statusDate,
        //         hireId: schedule.hireId,
        //         title: schedule.hire.title,
        //         importantInfo: schedule.hire.importantInfo,
        //         detailInfo: schedule.hire.detailInfo,
        //         hireImage: schedule.hire.hireImage,
        //         address: schedule.hire.address,
        //         experience: schedule.hire.experience,
        //         salary: schedule.hire.salary,
        //         deadLine: schedule.hire.deadLine,
        //         provider: schedule.hire.provider,
        //         hireUrl: schedule.hire.hireUrl,
        //         end: schedule.hire.end,
        //         companyId: schedule.hire.companyId,
        //         brand: schedule.hire.company.brand,
        //         logo: schedule.hire.company.logo,
        //         companyUrl: schedule.hire.company.companyUrl,
        //         intro: schedule.hire.company.intro,
        //         category: schedule.hire.company.categories.map(category => category.title),
        //         hireTech: schedule.hire.hireTeches.map(hireTech => hireTech.title),
        //         commentId: schedule.hireComment.id,
        //         advantage: schedule.hireComment.advantage,
        //         disAdvantage: schedule.hireComment.disAdvantage,
        //         strategy: schedule.hireComment.strategy
        //     }
        //     return data;
        // })
        const dataArray= scheduleSaver(req.body.id);
        res.json(dataArray);
    }catch(err){
        next(err);
    }
})

//기업 명 검색 시 기업정보, 채용정보 출력
router.get('/search',async(req,res,next)=>{
    try{
        const company = await Company.findAll({where: {brand: {[Op.like] : '%'+req.query.brand+'%' }},
            include:[{model: Category},{model:Hire, include:{model:HireTech}}]});
        let result = [];
        const dataArray = company.map(company => {
            for(var index in company.hires){
            const data = {
                companyId: company.id,
                brand: company.brand,
                logo: company.logo,
                companyUrl: company.companyUrl,
                intro: company.intro,
                provider: company.provider,
                category: company.categories.map(category => { return category.title }),
                hireId: company.hires[index].id,
                title: company.hires[index].title,
                importantInfo: company.hires[index].importantInfo,
                detailInfo: company.hires[index].detailInfo,
                hireImage: company.hires[index].hireImage,
                address: company.hires[index].address,
                experience: company.hires[index].experience,
                salary: company.hires[index].salary,
                deadLine: company.hires[index].deadLine,
                hireUrl: company.hires[index].hireUrl,
                end: company.hires[index].end,
                hireTech: company.hires[index].hireTeches.map(hireTech => hireTech.title),
            }
            result.push(data);
            }
        })
        res.json(result);
    }catch(err){
        next(err);
    }
})

//스케쥴 추가
router.post('/write',async(req,res,next)=>{
    try{
        //사용자 커스텀 기업
        const user = await User.find({where: {id: req.body.id}}) // 나중에 req.user.id로 (사용자 아이디)
        
        if(req.body.provider!=='rocketpunch'){
            const company = await Company.create({
                brand: req.body.brand,
                logo: req.body.logo,
                companyUrl: req.body.companyUrl,
                intro: req.body.intro,
                provider: 'user'
            })
            //사용자 - 기업 관계 추가
            await user.addCompanies(company.id)

            //커스텀 채용 정보 생성 및 기업-채용 관계 추가
            const hire = await Hire.create({
                title: req.body.title,
                importantInfo: req.body.importantInfo,
                detailInfo: req.body.detailInfo,
                hireImage: req.body.hireImage,
                address: req.body.address,
                experience: req.body.experience,
                salary: req.body.salary,
                deadLine: req.body.deadLine,
                hireUrl: req.body.hireUrl,
                companyId: company.id,
                provider: 'user'
            })
            
            //커스텀 카테고리 생성
            const result = await Promise.all(
                req.body.category.map(category => (
                    Category.findOrCreate({
                        where: {title: category}
                    })
                ))
            )
            
            //커스텀 카테고리-기업 관계 추가
            await company.addCategories(result.map(r=>r[0]));

            //스케쥴 생성-유저 관계 설정
            const schedule = await Schedule.create({
                status: req.body.status,
                statusDate: req.body.statusDate,
                userId: req.body.id,
                hireId: hire.id
            })

            //채용 메모 생성-스케줄 관계 설정
            await HireComment.create({
                advantage: req.body.advantage,
                disadvantage: req.body.disadvantage,
                strategy: req.body.strategy,
                scheduleId: schedule.id
            })
            
            //채용 요구 기술 생성
            const hireTech = await Promise.all(
                req.body.hireTech.map(tech => (
                    HireTech.findOrCreate({
                        where: {title: tech}
                    })
                ))
            )
            
            //채용 요구 기술-채용 관계 설정
            await hire.addHireTeches(hireTech.map(r=>r[0]));
            const dataArray = scheduleSaver(req.body.id);
            res.json(dataArray);
        }else{ //로켓 펀치 기업 정보일 때
            const hire = await Hire.find({where: {id: req.body.hireId}});
            //스케쥴 생성-채용,유저 관계 설정
            const schedule = await Schedule.create({
                status: req.body.status,
                statusDate: req.body.statusDate,
                hireId: req.body.hireId,
                userId: req.body.id
            })
            //채용 코멘트 생성-스케쥴 관계 설정
            await HireComment.create({
                advantage: req.body.advantage,
                disAdvantage: req.body.disAdvantage,
                startegy: req.body.strategy,
                scheduleId: schedule.id
            })
            const dataArray = scheduleSaver(req.body.id);
            res.json(dataArray);
        }
    }catch(err){
        next(err)
    }
})

router.patch('/company',async (req,res,next)=>{
    try{
    const updatedCompany = await Company.update({
        brand: req.body.brand,
        logo: req.body.logo,
        companyUrl: req.body.companyUrl,
        intro: req.body.intro
    },{where: {id: req.body.companyId, provider: 'user'}})
    
    const result = await Promise.all(
        req.body.category.map(category => (
            Category.findOrCreate({
                where: {title: category}
            })
        ))
    )

    await updatedCompany.setCategories(result.map(r=> r[0]));
    const dataArray = scheduleSaver(req.body.id);
    res.json(dataArray);
        }catch(err){
            next(err)
        }
})

router.patch('/hire',async (req,res,next)=>{
    try{
    const updatedHire = await Hire.update({
        title: req.body.title,
        importantInfo: req.body.importantInfo,
        detailInfo: req.body.detailInfo,
        hireImage: req.body.hireImage,
        address: req.body.address,
        experience: req.body.experience,
        salary: req.body.salary,
        deadLine: req.body.deadLine,
        hireUrl: req.body.hireUrl
    },{where: {id: req.body.hireId}})

    const result = await Promise.all(
        req.body.hireTech.map(tech => (
            HireTech.findOrCreate({
                where: {title: tech}
            })
        ))
    )
    await updatedHire.setCategories(result.map(r=> r[0]));
    const dataArray = scheduleSaver(req.body.id);
            res.json(dataArray);
        }catch(err){
            next(err)
        }
})

router.patch('/write',async(req,res,next)=>{
    try{
    const updatedSchedule = await Schedule.update({
        status: req.body.status,
        statusDate: req.body.statusDate
    },{where: {id: req.body.scheduleId}});
    
    const dataArray = scheduleSaver(req.body.id);
    res.json(dataArray);
    }catch(err){
        next(err)
    }
})

router.patch('/comment',async(req,res,next)=>{
    try{
    const updatedComment = Comment.update({
        advantage: req.body.advantage,
        disAdvantage: req.body.disAdvantage,
        strategy: req.body.startegy
    },{where: {id: req.body.commentId}});
    
    const dataArray = scheduleSaver(req.body.id);
    res.json(dataArray);
}catch(err){
    next(err);
}
})

router.delete('/',async (req,res,next)=>{
    try{
    if(req.body.provider === 'user'){
        await Company.destroy({
            where: {id: req.body.companyId}
        })
        await Hire.destroy({
            where: {id: req.body.hireId}
        })
        await Schedule.destroy({
            where: {id: req.body.scheduleId}
        })
        await HireComment.destroy({
            where: {id: req.body.commentId}
        })
    }else{
        await Schedule.destroy({where: {id: req.body.scheduleId}});
        await HireComment.destroy({where: {id: req.body.commentId}});
    }
    const dataArray = scheduleSaver(req.body.id);
    res.json(dataArray);
    }catch(err){
        next(err);
    }
})


module.exports = router;
