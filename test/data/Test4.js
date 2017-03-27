const Sequelize = require('sequelize');

module.exports = function(db, config)
{
    /**
     * Defines Test4.
     * @class Test4
     */
    var Test4 = db.define('Test4',
    /** @lends Test4 */
    {
        /** Primary identifier. */
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            allowNull : false
        },
        /** Text label. */
        label : {
            type : Sequelize.STRING(64),
            defaultValue : 'Hello world!'
        }
    });

    /**
     * Defines Test4Ref.
     * @class Test4Ref
     */
    var Test4Ref = db.define('Test4Ref',
    /** @lends Test4Ref */
    {
        /** Primary identifier. */
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            allowNull : false
        },
        /** Text label. */
        label : {
            type : Sequelize.STRING(128)
        },
        foreignId : {
            type : Sequelize.INTEGER,
            allowNull : false,
            references: {
                model: 'Test4',
                key: 'id'
            }
        }
    });

    //Test4.hasMany(Test4Ref);
}
