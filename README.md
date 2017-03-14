# sequelize-to-markdown

Sequelize to Markdown is a simple tool to document the data structure of [sequelize](https://www.npmjs.com/package/sequelize) models. It's output is template based to enable developers to change the output structure, style or even the output type e.g. by creating html [templates](#templating).

This module provides a comfortable API and a full featured command line client.

### Install

```
npm install -g sequelize-to-markdown
```

##### Requirements

This module works by including code. That means, that your model files get required like common modules. To enable sequelize-to-markdown to correctly load your models, each file included by this tool has to either provide a default function call or an init() method.

```
module.exports = function(db, config) { ... }
 - or -
module.exports.init = function(db, config) { ... }
```

To get your models documented, you will have to provide a small amount of doc comments in your code. To start a minimal setup, you only have to provide the **@class** and **@lends** (or @memberof) tags from [JSDoc](http://usejsdoc.org/). If you add text to your class and field definitions, it will be used as descriptions in the output.

```
/** @class MyUser */
sequelize.define('MyUser', {
    /** @lends MyUser */
    id : {
        type : DataTypes.INTEGER(),
        allowNull : false,
        primayKey : true,
        autoIncrement : true
    },
    name : {
        type : DataTypes.STRING(128),
        allowNull : false
    }
});
```

### Command-line interface

After installing and having your code read, you may use the command-line interface (CLI) on the terminal of your computer. The command is named "sq2md".

```
sq2md --help

  Usage: sq2md [options] <path>

  Options:

    -h, --help                     output usage information
    -r, --recursive                Scan <path> recursively.
    -t, --template <template>      Template file to use for output generation.
    -o, --output-type <type>       Where to put the output. Possible values: stdout, file, file-per-class, file-per-src.
    -f, --output-file <file>       File to output results to if output type is file.
    -p, --output-path <path>       Path to output results to if output type is file-per-class or file-per-src.
    -c, --config <file>            Path to a JSON config file to use.
    --init <name>                  Initialization function to be called for every source file.
    --init-config <config>         JSON config to be passed to an init function.
    --field-bl <field>[,<fields>]  List of fields to ignore.
    --dir-filter <regexp>          RegExp for filtering directories when looking for source files.
    --file-filter <regexp>         RegExp for filtering files when looking for models.
    --sq-config <config>           JSON config to be passed to sequelize.
```

#### Config file

The config file represents all configuration options available to run the tool. These are almost the same options as shown in the [DefaultConfig](#defaultconfig) section of the API description.

```
{
    "fieldBlacklist": [],
    "models": {
        "paths": [],
        "pathBlacklist": [],
        "recursive": false,
        "initFunction": null,
        "initConfig": {},
        "directoryFiler": "/[^\/\.*]/",
        "fileFilter": "/\.js$/"
    },
    "input": {
        "templateFile": "templates/default.njk"
    },
    "output": {
        "type": "StdOut",
        "file": {
            "splitting": "AllInOne",
            "path": null
        }
    },
    "sequelize": {}
}
```

### API

You might also want to use the API of this tool as a library. The library provides two methods to call. A parse() and a render() method. The parse method returns an object containing all information extracted from the source. The render() method does the same but outputs a processed template depending on the input and output settings of the passed configuration object.

```
const sq2md = require('sequelize-to-markdown');

var resultObj = sq2md.parse({ models : { paths : [ '...' ] } });
var resultStr = sq2md.render({ models : { paths : [ '...' ] } });

console.log(resultObj);
console.log(resultStr);
```

For configuration options please have a look at the [DefaultConfig](#defaultconfig) section.

#### Templating

This module uses [Nunjucks](https://www.npmjs.com/package/nunjucks) in order to structure the parsed sequelize models. By changing the provided or creating a new template, you would be able to create almost every formatted text output.

#### DefaultConfig

```
{
    fieldBlacklist : [ ],
    models : {
        paths : [ ],
        pathBlacklist : [ ],
        recursive : false,
        initFunction : null,
        initConfig : { },
        directoryFiler : new RegExp('/[^\/\.*]/'),
        fileFilter : new RegExp('\.js$')
    },
    input : {
        templateFile : 'templates/default.njk'
    },
    output : {
        type : this.OutputType.ReturnOnly,
        file : {
            splitting : this.FileSplitting.AllInOne,
            path : null
        }
    },
    sequelize : {

    }
}
```
