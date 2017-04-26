'use strict'

const Sequelize = require('sequelize');
const fs = require('fs');
const pathjs = require('path');
const extend = require('extend');
const jsdoc = require('jsdoc-api');
const nunjucks = require('nunjucks');
const helper = require('./helper.js');

/**
 * Enumeration providing a list of all built-in output types.
 * @enum
 */
module.exports.OutputType = {
    /** Just return a string. */
    ReturnOnly : 'ReturnOnly',
    /** Print all to stdout. */
    StdOut : 'StdOut',
    /** Write everything to files. */
    File : 'File'
}

/**
 * Enumeration providing a list of all possible file output types.
 * @enum
 */
module.exports.FileSplitting = {
    /** Put all results into one big file. */
    AllInOne : 'AllInOne',
    /** Create one result file per class/entity. */
    OnePerClass : 'OnePerClass',
    /** Output results the way they where defined together in the corresponding source files. */
    AsInSource : 'AsInSource'
}

/**
 * Defines a default configuration with all possible configuration options.
 *
 * @prop {array} fieldBlacklist - A list of field names not to include in the output.
 * @prop {object} models - Model related configuration.
 * @prop {array} models.paths - A list of source paths to look for models. This may contain files and directories.
 * @prop {array} models.pathBlacklist - A list of files or directories not to include. May contain absolute and relative paths.
 * @prop {boolean} models.recursive - Whenever to walk recursively through proviced directory paths.
 * @prop {string} models.initFunction - Name of a initialization to call on each model file included.
 * @prop {object} models.initConfig - Configuration object to be passed when a model file gets initialized.
 * @prop {RegExp} models.directoryFiler - Regular Expression for more advanced filtering of directories to include.
 * @prop {RegExp} models.fileFilter - Regular Expression for more advanced filtering of files to include.
 * @prop {object} input - Input configuration.
 * @prop {string} input.templateFile - Nunjucks template file used to create templated output.
 * @prop {object} output - Output configuration.
 * @prop {OutputType} output.type - Output type configuration.
 * @prop {object} output.file - Configuration for OutputType.File.
 * @prop {FileSplitting} output.file.splitting - Defines on how file output should be generated.
 * @prop {string} output.file.path - Depending on the splitting option a single file or a directory path.
 * @prop {string} output.file.extension - Extension to add to each output file if *path* does not aleady represent a file path.
 * @prop {function} output.contentFilter - Provides a post-render content filter.
 * @prop {object}  sequelize - Configuration passed to the constructor of sequelize.
 */
 module.exports.DefaultConfig = {
    fieldBlacklist : [ ],
    models : {
        paths : [ ],
        pathBlacklist : [ ],
        recursive : false,
        initFunction : null,
        initConfig : { },
        directoryFilter : new RegExp('[^\/\.*]'),
        fileFilter : new RegExp('\.js$')
    },
    input : {
        templateFile : __dirname + '/../templates/default.njk'
    },
    output : {
        type : this.OutputType.ReturnOnly,
        file : {
            splitting : this.FileSplitting.AllInOne,
            path : null,
            extension : '.md'
        },
        contentFilter : item => item.replace(/\n{3,}/g, "\n\n")
    },
    sequelize : {

    }
}

/**
 * Parses and renders sequelize models. Depending on the provided configuration, this method will send its
 * output to different locations.
 * @param {object} config - Configuration based on the options provided by [DefaultConfig](#defaultconfig).
 */
module.exports.render = function(config)
{
    config = extend(true, { }, this.DefaultConfig, config);

    var entries = this.parse(config);
    var templateFile = pathjs.resolve(config.input.templateFile);
    var contentFilter = config.output.contentFilter;

    nunjucks.configure(pathjs.dirname(templateFile), { autoescape : false });

    if(config.output.type === this.OutputType.ReturnOnly)
    {
        var rendered = nunjucks.render(templateFile, { entities : entries });
        return (contentFilter && contentFilter(rendered)) || rendered;
    }
    else if(config.output.type === this.OutputType.StdOut)
    {
        var rendered = nunjucks.render(templateFile, { entities : entries })
        process.stdout.write((contentFilter && contentFilter(rendered)) || rendered);
    }
    else if(config.output.type === this.OutputType.File)
    {
        if(config.output.file.splitting === this.FileSplitting.AllInOne)
        {
            var rendered = nunjucks.render(templateFile, { entities : entries });
            fs.writeFileSync(config.output.file.path, (contentFilter && contentFilter(rendered)) || rendered);
        }
        else if(config.output.file.splitting === this.FileSplitting.OnePerClass)
        {
            entries.forEach(entry =>
            {
                var path = pathjs.resolve(config.output.file.path + '/' + entry.name + config.output.file.extension);
                var rendered = nunjucks.render(templateFile, { entities : [ entry ] });

                fs.writeFileSync(path, (contentFilter && contentFilter(rendered)) || rendered);
            });
        }
        else if(config.output.file.splitting === this.FileSplitting.AsInSource)
        {
            var entriesPerFile = { }
            entries.forEach(entry =>
            {
                if(entriesPerFile[entry.filename])
                    entriesPerFile[entry.filename].push(entry)
                else
                    entriesPerFile[entry.filename] = [ entry ];
            });

            for(var key in entriesPerFile)
            {
                var plainFilename = pathjs.basename(key, pathjs.extname(key));
                var path = pathjs.resolve(config.output.file.path + '/' + plainFilename + config.output.file.extension);
                var rendered = nunjucks.render(templateFile, { entities : entriesPerFile[key] });

                fs.writeFileSync(path, (contentFilter && contentFilter(rendered)) || rendered);
            }
        }
    }
}

/**
 * Parses sequelize models and returns a data structure with the required data.
 * @param {object} config - Configuration based on the options provided by [DefaultConfig](#defaultconfig)
 * @returns {object}
 */
module.exports.parse = function(config)
{
    config = extend(true, { }, this.DefaultConfig, config);
    var models = config.models;

    var modelNamePluralMap = { };
    var sqOpts = extend(true, config.sequelize, {
        hooks : {
            beforeDefine : (attr, opts) => modelNamePluralMap[opts.name.plural] = opts.name.singular
        }
    });

    var allFiles = helper.listFiles(models.paths, models.recursive, models.fileFilter, models.directoryFilter);

    const db = new Sequelize('sqlite://', sqOpts);
    const ignoreFields = config.fieldBlacklist;
    const initFunction = config.models.initFunction;
    const initConfig = config.models.initConfig;

    if(models.pathBlacklist)
        allFiles = helper.filterBlacklist(allFiles, models.pathBlacklist);

    if(initFunction)
    {
        allFiles.forEach(file =>
        {
            var module = require(file);

            if(typeof module[initFunction] !== 'function')
                throw new Error(`Module does not provide initializer function ${initFunction}: ` + file);

            module[initFunction](db, initConfig);
        });
    }
    else
    {
        allFiles.forEach(file =>
        {
            var module = require(file);

            if(typeof module !== 'function')
                throw new Error('Module does not provide default initializer: ' + file);

            module(db, initConfig);
        });
    }

    const explained = jsdoc.explainSync({ caching : false, files : allFiles });
    const allClasses = explained.filter(item => item.kind === 'class' && item.access != 'private');
    const allMembers = explained.filter(item => item.kind === 'member' && item.access != 'private');

    var indexedMembers = { };
    allMembers.forEach(member => indexedMembers[member.longname] = member);

    return allClasses.sort((a, b) => a.name.localeCompare(b.name)).map(clss =>
    {
        var item = {
            name : clss.longname,
            filename : clss.meta.filename,
            path : clss.meta.path + '/' + clss.meta.filename,
            description : clss.description,
            examples : clss.examples,
            attributes : [ ]
        };

        const model = db.models[item.name];

        if(model)
        {
            for(var key in model.rawAttributes)
            {
                const attr = model.rawAttributes[key];
                const longName = model.name + '.' + attr.fieldName;
                const processField = ignoreFields.indexOf(attr.fieldName) === -1;
                const memberIsPublic = !indexedMembers[longName] || indexedMembers[longName].access != 'private';

                if(processField && memberIsPublic)
                {
                    var attribute = {
                        name : attr.fieldName,
                        longName : longName,
                        type : attr.type.key,
                        length : (attr.type.options && attr.type.options.length) || '',
                        primaryKey : attr.primaryKey || false,
                        autoIncrement : attr.autoIncrement || false,
                        allowNull : attr.allowNull === undefined ? true : attr.allowNull,
                        defaultValue : undefined,
                        description : indexedMembers[longName] && indexedMembers[longName].description
                    };

                    if(attr.defaultValue)
                    {
                        if(typeof attr.defaultValue === 'function')
                            attribute['defaultValue'] = attr.defaultValue.key || 'function';
                        else
                            attribute['defaultValue'] = attr.defaultValue + '';
                    }

                    if(attr.references)
                    {
                        attribute['references'] = {
                            model : modelNamePluralMap[attr.references.model] || attr.references.model,
                            key : attr.references.key
                        }
                    }

                    var attributeNames = [ ];

                    if(attribute.primaryKey)
                        attributeNames.push('PK');
                    if(attribute.autoIncrement)
                        attributeNames.push('AI');
                    if(!attribute.allowNull)
                        attributeNames.push('NN');
                    if(attribute.references)
                        attributeNames.push('FK');

                    if(attribute.defaultValue !== undefined)
                        attributeNames.push('DEFAULT(' + attr.defaultValue + ')');

                    attribute['attributeNames'] = attributeNames;
                    item['attributes'].push(attribute);
                }
            }

            for(var key in model.associations)
            {
                var assoc = model.associations[key];
                var name = assoc.target.name;
                var alias = assoc.as;

                item['associations'] = item['associations'] || [ ];
                item['associations'].push({
                    name : name,
                    alias : alias,
                    foreignKey : assoc.foreignKey,
                    type : assoc.associationType
                })
            };
        }

        return item;
    });
}
