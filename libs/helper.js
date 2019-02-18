'use strict'

const fs = require('fs');
const pathJs = require('path');
const escape = require('escape-html');

module.exports.filterBlacklist = function(toBeFiltered, blacklist)
{
    return toBeFiltered.filter(item =>
    {
        for(var i in blacklist)
            if(item.indexOf(blacklist[i]) !== -1)
                return false;

        return true;
    });
}

module.exports.listFiles = function(path, recursive, fileFilter, dirFilter)
{
    var results = [ ];

    if(Array.isArray(path))
    {
        var self = this;
        path.forEach(localPath => results = results.concat(self.listFiles(localPath, recursive, fileFilter, dirFilter)));
    }
    else
    {
        var fullPath = pathJs.resolve(path);
        var stats = fs.existsSync(fullPath) && fs.statSync(fullPath);

        if(stats && stats.isFile())
        {
            if(!fileFilter || fileFilter.test(fullPath))
                results.push(fullPath);
        }
        else if(stats && stats.isDirectory())
        {
            if(recursive)
            {
                fs.readdirSync(fullPath)
                    .map(item => pathJs.join(fullPath, item))
                    .filter(item => !dirFilter || dirFilter.test(item))
                    .map(item => this.listFiles(item, recursive, fileFilter, dirFilter)
                    .forEach(item => results.push(item)));
            }
            else
            {
                results = fs.readdirSync(fullPath)
                    .map(item => pathJs.join(fullPath, item))
                    .filter(item => !dirFilter || dirFilter.test(item));
            }
        }
        else if(!stats)
        {
            throw new Error('Path does not exist: ' + fullPath);
        }
    }

    return results;
}

module.exports.mkdirp = function(path)
{
    let current = '';
    const subPaths = pathJs.dirname(path).split(pathJs.sep);

    for(const subPath of subPaths)
    {
        current = `${current}${subPath}${pathJs.sep}`;

        if(!fs.existsSync(current))
            fs.mkdirSync(current);
        else if(fs.lstatSync(current).isFile())
            throw new Error(`path '${current}' is a File.`);
    }
};

module.exports.prepareComment = function(comment)
{
    return comment ? escape(comment).replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;') : undefined;
};
