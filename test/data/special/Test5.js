const Sequelize = require('sequelize');

module.exports.init = function(db, config)
{
    /**
     * Defines Test5.
     * @class Test5
     */
    var Test5 = db.define('Test5',
    /** @lends Test5 */
    {
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            allowNull : false
        },
        label : {
            type : Sequelize.STRING(64),
            defaultValue : () => 'Hello world!'
        },
        date : {
            type : Sequelize.DATE,
            defaultValue : Sequelize.NOW
        }
    });
}
