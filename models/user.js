module.exports = (sequelize,DataTypes) => (
    sequelize.define('user',{
        snsId:{
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        email:{
            type: DataTypes.STRING(50),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        nick:{
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        profile:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        blog:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        github:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        phone:{
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        provider:{
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        photo:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        newUser:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
)
