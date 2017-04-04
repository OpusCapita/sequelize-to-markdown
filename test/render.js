'use strict'
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const pathjs = require('path');
const sq2md = require('../libs/index.js');

describe('Rendering', () =>
{
    it('render() #1', () =>
    {
        var rendered = sq2md.render({
            models : {
                paths : [ './test/data/Test0.js' ]
            }
        });

        assert.equal(rendered, fs.readFileSync('./test/data/rendered/render0.txt', 'utf8'));
    });

    it('render() #2', () =>
    {
        var rendered = sq2md.render({
            fieldBlacklist : [ 'updatedAt', 'createdAt' ],
            models : {
                paths : [ './test/data/Test1.js' ]
            }
        });

        assert.equal(rendered, fs.readFileSync('./test/data/rendered/render1.txt', 'utf8'));
    });

    it('render() #3', () =>
    {
        var rendered = sq2md.render({
            fieldBlacklist : [ 'updatedAt', 'createdAt' ],
            models : {
                paths : [ './test/data' ],
                recursive : true,
                pathBlacklist : [ 'special', 'Test4.js' ]
            }
        });

        assert.equal(rendered, fs.readFileSync('./test/data/rendered/render2.txt', 'utf8'));
    });

    it('render() #4', () =>
    {
        var outPath = pathjs.join(os.tmpdir(), Math.random() + '.txt');

        var rendered = sq2md.render({
            fieldBlacklist : [ 'updatedAt', 'createdAt' ],
            models : {
                paths : [ './test/data' ],
                recursive : true,
                pathBlacklist : [ 'special', 'Test4.js' ]
            },
            output : {
                type : sq2md.OutputType.File,
                file : {
                    path : outPath
                }
            }
        });

        assert.equal(fs.readFileSync(outPath, 'utf8'), fs.readFileSync('./test/data/rendered/render3.txt', 'utf8'));
        fs.unlinkSync(outPath);
    });

    it('render() #5', () =>
    {
        var outPath = pathjs.join(os.tmpdir(), Math.random() + '');
        fs.mkdirSync(outPath);

        var rendered = sq2md.render({
            fieldBlacklist : [ 'updatedAt', 'createdAt' ],
            models : {
                paths : [ './test/data' ],
                recursive : true,
                pathBlacklist : [ 'special', 'Test4.js' ]
            },
            output : {
                type : sq2md.OutputType.File,
                file : {
                    splitting : sq2md.FileSplitting.OnePerClass,
                    path : outPath,
                    extension : '.txt'
                }
            }
        });

        var files = {
            'Test0.txt' : 'render4_1.txt',
            'Test1.txt' : 'render4_2.txt',
            'Test1Ref.txt' : 'render4_3.txt',
            'Test2.txt' : 'render4_4.txt',
            'Test2Ref.txt' : 'render4_5.txt'
        };

        for(var ref in files)
        {
            var refPath = pathjs.join(outPath, ref)
            var filePath = './test/data/rendered/' + files[ref];

            assert.equal(fs.readFileSync(refPath, 'utf8'), fs.readFileSync(filePath, 'utf8'));
            fs.unlinkSync(refPath);
        }

        fs.rmdirSync(outPath);
    });

    it('render() #6', () =>
    {
        var outPath = pathjs.join(os.tmpdir(), Math.random() + '');
        fs.mkdirSync(outPath);

        var rendered = sq2md.render({
            fieldBlacklist : [ 'updatedAt', 'createdAt' ],
            models : {
                paths : [ './test/data' ],
                recursive : true,
                pathBlacklist : [ 'special', 'Test4.js' ],
                directoryFilter : null
            },
            output : {
                type : sq2md.OutputType.File,
                file : {
                    splitting : sq2md.FileSplitting.AsInSource,
                    path : outPath,
                    extension : '.txt'
                }
            }
        });

        var files = {
            'Test0.txt' : 'render5_1.txt',
            'Test1.txt' : 'render5_2.txt',
            'Test2.txt' : 'render5_3.txt'
        };

        for(var ref in files)
        {
            var refPath = pathjs.join(outPath, ref)
            var filePath = './test/data/rendered/' + files[ref];

            assert.equal(fs.readFileSync(refPath, 'utf8'), fs.readFileSync(filePath, 'utf8'));
            fs.unlinkSync(refPath);
        }

        fs.rmdirSync(outPath);
    });

    it('render() #7', () =>
    {
        var rendered = sq2md.render({
            models : {
                paths : [ './test/data/Test0.js' ]
            },
            output : {
                type : sq2md.OutputType.StdOut
            }
        });
    });

    it('render() #8', () =>
    {
        var rendered = sq2md.render({
            models : {
                paths : [ './test/data/Test4.js' ]
            }
        });

        assert.equal(rendered, fs.readFileSync('./test/data/rendered/render6.txt', 'utf8'));
    });
});
