const Sequelize = require('sequelize');

module.exports = function(db, config)
{
    /**
     * Defines Test0.
     * @class Test0
     */
    db.define('Test0',
    /** @lends Test0 */
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
