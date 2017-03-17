const Sequelize = require('sequelize');

module.exports = function(db, config)
{
    /**
     * Defines Test1.
     * @class Test1
     */
    var Test1 = db.define('Test1',
    /** @lends Test1 */
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
     * Defines Test1Ref.
     * @class Test1Ref
     */
    var Test1Ref = db.define('Test1Ref',
    /** @lends Test1Ref */
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
        }
    });

    Test1.hasMany(Test1Ref);
}
