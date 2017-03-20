const Sequelize = require('sequelize');

module.exports.init = function(db, config)
{
    /**
     * Defines Test3.
     * @class Test3
     */
    db.define('Test3',
    /** @lends Test3 */
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
}
