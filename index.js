#!/usr/bin/env node
'use strict'

const cmd = require('commander');
const sq2md = require('./libs/index.js');
const fs = require('fs');
const pathjs = require('path');

cmd.arguments('[path]')
    .option('-r, --recursive', 'Scan <path> recursively.')
    .option('-t, --template <template>', 'Template file to use for output generation.', checkTemplate)
    .option('-o, --output-type <type>', 'Where to put the output. Possible values: stdout, file, file-per-class, file-per-src.', parseOutputType)
    .option('-f, --output-file <file>', 'File to output results to if output type is file.', checkOutputFile)
    .option('-p, --output-path <path>', 'Path to output results to if output type is file-per-class or file-per-src.', checkOutputDir)
    .option('-c, --config <file>', 'Path to a JSON config file to use.', loadConfig)
    .option('--init <name>', 'Initialization function to be called for every source file.')
    .option('--init-config <config>', 'JSON config to be passed to an init function.', JSON.parse)
    .option('--output-ext <extension>', 'File extension of result files if output type is file-per-class or file-per-src.', validateExt)
    .option('--field-bl <field>[,<fields>]', 'List of fields to ignore.', parseFieldList)
    .option('--dir-filter <regexp>', 'RegExp for filtering directories when looking for source files.', createRegExp)
    .option('--file-filter <regexp>', 'RegExp for filtering files when looking for models.', createRegExp)
    .option('--sq-config <config>', 'JSON config to be passed to sequelize.', JSON.parse)
    .action((path, cmd) =>
    {
        var config = cmd.config || {
                fieldBlacklist : cmd.fieldBl || [ ],
                models : {
                    paths : [ path ],
                    initFunction : cmd.init,
                    initConfig : cmd.initConfig || sq2md.DefaultConfig.models.initConfig,
                    recursive : cmd.recursive || sq2md.DefaultConfig.models.recursive,
                    directoryFilter : cmd.dirFilter || sq2md.DefaultConfig.models.dirFilter,
                    fileFilter : cmd.fileFilter || sq2md.DefaultConfig.models.fileFilter
                },
                input : {
                    templateFile : cmd.template || sq2md.DefaultConfig.input.templateFile
                },
                output : {
                    type : (cmd.outputType && cmd.outputType.type) || sq2md.OutputType.StdOut,
                    file : {
                        splitting : (cmd.outputType && cmd.outputType.splitting) || sq2md.FileSplitting.AllInOne,
                        path : cmd.outputFile || cmd.outputPath,
                        extension : cmd.outputExt || sq2md.DefaultConfig.output.file.extension
                    }
                },
                sequelize : cmd.sqConfig || sq2md.DefaultConfig.sequelize
            }

        sq2md.render(config);
    })
    .parse(process.argv);


function checkTemplate(path)
{
    path = pathjs.resolve(path);

    if(!fs.existsSync(path))
        throw new Error('Template could not be found: ' + path);

    return path;
}

function parseOutputType(input)
{
    switch(input.toLowerCase())
    {
        case 'stdout':
            return { type : sq2md.OutputType.StdOut };
        case 'file':
            return { type : sq2md.OutputType.File, splitting : sq2md.FileSplitting.AllInOne };
        case 'file-per-class':
            return { type : sq2md.OutputType.File, splitting : sq2md.FileSplitting.OnePerClass };
        case 'file-per-src':
            return { type : sq2md.OutputType.File, splitting : sq2md.FileSplitting.AsInSource };
    }

    throw new Error('Invalid output type: ' + input);
}

function checkOutputFile(path)
{
    return checkOutputDir(pathjs.dirname(path)) + '/' + pathjs.basename(path);
}

function checkOutputDir(path)
{
    path = pathjs.resolve(path);

    if(!fs.existsSync(path))
        throw new Error('Output path could not be found: ' + path);

    return path;
}

function loadConfig(path)
{
    path = pathjs.resolve(path);

    if(!fs.existsSync(path))
        throw new Error('Config file does not exist: ' + path);

    var config = JSON.parse(fs.readFileSync(path));

    if(config.models.directoryFiler)
        config.models.directoryFiler = new RegExp(config.models.directoryFiler);
    if(config.models.fileFilter)
        config.models.fileFilter = new RegExp(config.models.fileFilter);

    return config;
}

function validateExt(input)
{
    return input.startsWith('.') ? input : '.' + input;
}

function parseFieldList(input)
{
    return input.split(',').map(item => item.trim());
}

function createRegExp(input)
{
    return new RegExp(input);
}
