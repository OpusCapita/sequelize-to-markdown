const Sequelize = require('sequelize');

module.exports = function(db, config)
{
    /**
     * Defines Test2.
     * @class Test2
     */
    var Test2 = db.define('Test2',
    /** @lends Test2 */
    {
        /** Primary identifier. */
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            allowNull : false
        },
        /** Created timestamp. */
        created : {
            type : Sequelize.DATE(),
            defaultValue : Sequelize.NOW
        }
    });

    /**
     * Defines Test2Ref.
     * @class Test2Ref
     */
    var Test2Ref = db.define('Test2Ref',
    /** @lends Test2Ref */
    {
        /** Primary identifier. */
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true
        },
        /** Text label. */
        label : {
            type : Sequelize.STRING(128)
        }
    });

    Test2.hasOne(Test2Ref, { foreignKey : 'test2id', as : 'test2-table' });
}
