/**
 * Per #17, this script is designed to generate a markdown formatted table
 * from the keybindings dict file.
 */

var fs = require('fs');

var shell = require('shelljs');
var table = require('markdown-table');

// Convert our dict file to a json format we can parse
shell.exec('plutil -convert json -r -e json -o - DefaultKeyBinding.dict > DefaultKeyBinding.json');

var keybindings = JSON.parse(fs.readFileSync('DefaultKeyBinding.json', 'utf8'));

var bindingsTable = [
    ['Phrase', 'Inserted Text']
];
var bindingsTmp = [];

each(keybindings['§'], gatherPhrases());

var now = new Date();
var bindingsMarkdown = '# Key Bindings'
    + '\n\n' + table(bindingsTable, { start: '', end: '' })
    + '\n\n\n\n' + '------------------------------------------'
    + '\n' + 'Generated on ' + now.toUTCString();

fs.writeFile('BINDINGS.md', bindingsMarkdown, function (err) {
    if (err) {
        throw err;
    }

    console.log('BINDINGS.md updated successfully!');
    process.exit();
});

function each (obj, fn) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            fn(obj[prop], prop, obj);
        }
    }
}

function gatherPhrases (parent) {
    return function (val, key, obj) {
        var valid = validBinding(val);
        var index;

        if (parent) {
            index = bindingsTmp.indexOf(parent);
            parent += key;

            if (index > -1) {
                bindingsTmp.splice(index, 1);
            }
        } else {
            parent = key;
        }

        if (valid) {
            bindingsTable.push([parent, valid]);
        } else {
            bindingsTmp.push(parent);
            each(val, gatherPhrases(parent));
        }
    }
}

function validBinding (val) {
    return isArray(val) && val[0] === 'insertText:'
        ? val[1]
        : false;
}

function isArray (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}
