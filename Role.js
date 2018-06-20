const Sequelize = require('sequelize');

module.exports.init = async function(db, config)
{
    /**
     * Data model representing the roles in system
     * @class Role
     */
    const Role = db.define('Role',
    /** @lends Role */
    {
        /** Unique identifier of each roles in system */
        id: {
            field: 'id',
            type: Sequelize.STRING(50),
            allowNull: false,
            primaryKey: true
        },
        /** Identifier of supplier to which the role belongs to, if any */
        supplierId: {
            field: 'supplierId',
            type: Sequelize.STRING(30),
            allowNull: true
        },
        /** Identifier of customer to which the role belongs to, if any */
        customerId: {
            field: 'customerId',
            type: Sequelize.STRING(30),
            allowNull: true
        },
        /** Identitifer of system/user, who created the data **/
        createdBy: {
            field: 'createdBy',
            type: Sequelize.STRING(60),
            allowNull: false,
            defaultValue: ''
        },
        /** Identitifer of system/user, who updated the data **/
        changedBy: {
            field: 'changedBy',
            type: Sequelize.STRING(60),
            allowNull: false,
            defaultValue: ''
        },
        /** Date time specifies when the record is created **/
        createdOn: {
            field: 'createdOn',
            type: Sequelize.DATE(),
            defaultValue: Sequelize.fn('NOW'),
            allowNull: false
        },
        /** Date time, when the record is been updated **/
        changedOn: {
            field: 'changedOn',
            type: Sequelize.DATE(),
            allowNull: true
        }
    }, {
        freezeTableName: true,
        updatedAt: 'changedOn',
        createdAt: 'createdOn',
    });
}
