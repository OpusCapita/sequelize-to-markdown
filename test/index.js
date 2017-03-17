'use strict'
const assert = require('assert');
const sq2md = require('../libs/index.js');

describe('Main', () =>
{
    describe('parse() #1', () =>
    {
        var parsed = sq2md.parse({
            models : {
                paths : [ './test/data/Test0.js' ]
            }
        });

        assert.ok(Array.isArray(parsed));
        assert.equal(parsed.length, 1);

        var Test = { T0 : parsed[0] };

        assert.equal(Test.T0.name, 'Test0');
        assert.equal(Test.T0.filename, 'Test0.js');
        assert.ok(Test.T0.path.endsWith('/test/data/Test0.js'));
        assert.equal(Test.T0.description, 'Defines Test0.');
        assert.equal(Test.T0.attributes.length, 4);

        var attr = Test.T0.attributes;

        assert.equal(JSON.stringify(attr[0]), '{"name":"id","longName":"Test0.id","type":"INTEGER","length":"","primaryKey":true,"autoIncrement":true,"allowNull":false,"description":"Primary identifier.","attributeNames":["PK","AI","NN"]}');
        assert.equal(JSON.stringify(attr[1]), '{"name":"label","longName":"Test0.label","type":"STRING","length":64,"primaryKey":false,"autoIncrement":false,"allowNull":true,"defaultValue":"Hello world!","description":"Text label.","attributeNames":["DEFAULT(Hello world!)"]}');
        assert.equal(JSON.stringify(attr[2]), '{"name":"createdAt","longName":"Test0.createdAt","type":"DATE","length":"","primaryKey":false,"autoIncrement":false,"allowNull":false,"attributeNames":["NN"]}');
        assert.equal(JSON.stringify(attr[3]), '{"name":"updatedAt","longName":"Test0.updatedAt","type":"DATE","length":"","primaryKey":false,"autoIncrement":false,"allowNull":false,"attributeNames":["NN"]}');
    });

    describe('parse() #2', () =>
    {
        var parsed = sq2md.parse({
            fieldBlacklist : [ 'updatedAt', 'createdAt' ],
            models : {
                paths : [ './test/data/Test1.js' ]
            }
        });

        assert.ok(Array.isArray(parsed));
        assert.equal(parsed.length, 2);

        var Test = { T0 : parsed[0], T1 : parsed[1] };

        assert.equal(Test.T0.name, 'Test1');
        assert.equal(Test.T0.filename, 'Test1.js');
        assert.ok(Test.T0.path.endsWith('/test/data/Test1.js'));
        assert.equal(Test.T0.description, 'Defines Test1.');
        assert.equal(Test.T0.attributes.length, 2);

        var attr = Test.T0.attributes;

        assert.equal(JSON.stringify(attr[0]), '{"name":"id","longName":"Test1.id","type":"INTEGER","length":"","primaryKey":true,"autoIncrement":true,"allowNull":false,"description":"Primary identifier.","attributeNames":["PK","AI","NN"]}');
        assert.equal(JSON.stringify(attr[1]), '{"name":"label","longName":"Test1.label","type":"STRING","length":64,"primaryKey":false,"autoIncrement":false,"allowNull":true,"defaultValue":"Hello world!","description":"Text label.","attributeNames":["DEFAULT(Hello world!)"]}');




        assert.equal(Test.T1.name, 'Test1Ref');
        assert.equal(Test.T1.filename, 'Test1.js');
        assert.ok(Test.T1.path.endsWith('/test/data/Test1.js'));
        assert.equal(Test.T1.description, 'Defines Test1Ref.');
        assert.equal(Test.T1.attributes.length, 3);

        var attr = Test.T1.attributes;

        assert.equal(JSON.stringify(attr[0]), '{"name":"id","longName":"Test1Ref.id","type":"INTEGER","length":"","primaryKey":true,"autoIncrement":true,"allowNull":false,"description":"Primary identifier.","attributeNames":["PK","AI","NN"]}');
        assert.equal(JSON.stringify(attr[1]), '{"name":"label","longName":"Test1Ref.label","type":"STRING","length":128,"primaryKey":false,"autoIncrement":false,"allowNull":true,"description":"Text label.","attributeNames":[]}');
        assert.equal(JSON.stringify(attr[2]), '{"name":"Test1Id","longName":"Test1Ref.Test1Id","type":"INTEGER","length":"","primaryKey":false,"autoIncrement":false,"allowNull":true,"references":{"model":"Test1","key":"id"},"attributeNames":["FK"]}');

        var assoc = Test.T0.associations[0];

        assert.equal(assoc.name, 'Test1Ref');
        assert.equal(assoc.alias, 'Test1Refs');
        assert.equal(assoc.foreignKey, 'Test1Id');
        assert.equal(assoc.type, 'HasMany');
    });

    describe('parse() #3', () =>
    {
        var parsed = sq2md.parse({
            fieldBlacklist : [ 'updatedAt', 'createdAt' ],
            models : {
                paths : [ './test/data/inner/Test2.js' ]
            }
        });

        assert.ok(Array.isArray(parsed));
        assert.equal(parsed.length, 2);

        var Test = { T0 : parsed[0], T1 : parsed[1] };

        assert.equal(Test.T0.name, 'Test2');
        assert.equal(Test.T0.filename, 'Test2.js');
        assert.ok(Test.T0.path.endsWith('/test/data/inner/Test2.js'));
        assert.equal(Test.T0.description, 'Defines Test2.');
        assert.equal(Test.T0.attributes.length, 2);

        var attr = Test.T0.attributes;

        assert.equal(JSON.stringify(attr[0]), '{"name":"id","longName":"Test2.id","type":"INTEGER","length":"","primaryKey":true,"autoIncrement":true,"allowNull":false,"description":"Primary identifier.","attributeNames":["PK","AI","NN"]}');
        assert.equal(JSON.stringify(attr[1]), '{"name":"created","longName":"Test2.created","type":"DATE","length":"","primaryKey":false,"autoIncrement":false,"allowNull":true,"defaultValue":"NOW","description":"Created timestamp.","attributeNames":["DEFAULT(NOW)"]}');



        assert.equal(Test.T1.name, 'Test2Ref');
        assert.equal(Test.T1.filename, 'Test2.js');
        assert.ok(Test.T1.path.endsWith('/test/data/inner/Test2.js'));
        assert.equal(Test.T1.description, 'Defines Test2Ref.');
        assert.equal(Test.T1.attributes.length, 3);

        var attr = Test.T1.attributes;

        assert.equal(JSON.stringify(attr[0]), '{"name":"id","longName":"Test2Ref.id","type":"INTEGER","length":"","primaryKey":true,"autoIncrement":false,"allowNull":true,"description":"Primary identifier.","attributeNames":["PK"]}');
        assert.equal(JSON.stringify(attr[1]), '{"name":"label","longName":"Test2Ref.label","type":"STRING","length":128,"primaryKey":false,"autoIncrement":false,"allowNull":true,"description":"Text label.","attributeNames":[]}');
        assert.equal(JSON.stringify(attr[2]), '{"name":"test2id","longName":"Test2Ref.test2id","type":"INTEGER","length":"","primaryKey":false,"autoIncrement":false,"allowNull":true,"references":{"model":"Test2","key":"id"},"attributeNames":["FK"]}');

        assert.ok(Array.isArray(Test.T0.associations));
        assert.equal(1, Test.T0.associations.length);

        var assoc = Test.T0.associations[0];

        assert.equal(assoc.name, 'Test2Ref');
        assert.equal(assoc.alias, 'test2-table');
        assert.equal(assoc.foreignKey, 'test2id');
        assert.equal(assoc.type, 'HasOne');

        /*Test.T1.attributes.forEach(attr =>
        {
            console.log('assert.equal(JSON.stringify(attr[]), \''+ JSON.stringify(attr) +'\');');
        });*/
    });

    describe('parse() #4', () =>
    {
        var parsed = sq2md.parse({
            fieldBlacklist : [ 'updatedAt', 'createdAt' ],
            models : {
                paths : [ './test/data' ],
                recursive : true
            }
        });

        assert.ok(Array.isArray(parsed));
        assert.equal(parsed.length, 5);
    });

    describe('parse() #5', () =>
    {
        var parsed = sq2md.parse({
            models : {
                paths : [ './test/data/Test1.js', './test/data/inner/Test2.js' ]
            }
        });

        assert.ok(Array.isArray(parsed));
        assert.equal(parsed.length, 4);
    });

    describe('render()', () =>
    {});
});
