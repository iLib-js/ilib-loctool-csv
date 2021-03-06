/*
 * testCSVFile.js - test the CSV file handler object.
 *
 * Copyright © 2019-2020, Box, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (!CSVFile) {
    var CSVFile = require("../CSVFile.js");
    var CSVFileType = require("../CSVFileType.js");

    var CustomProject = require("loctool/lib/CustomProject.js");
    var TranslationSet = require("loctool/lib/TranslationSet.js");
    var ResourceString = require("loctool/lib/ResourceString.js");
}

var p = new CustomProject({
    name: "foo",
    id: "foo",
    plugins: ["../."],
    sourceLocale: "en-US"
}, "./test/testfiles", {
    nopseudo: true,
    locales:["en-GB"],
    targetDir: "./test/testfiles"
});

var p2 = new CustomProject({
    name: "foo",
    id: "foo",
    plugins: ["../."],
    sourceLocale: "en-US"
}, "./test/testfiles", {
    locales:["en-GB"],
    targetDir: "./test/testfiles",
    csv: {
        mappings: {
            "**/*.csv": {
                method: "copy",
                template: "[dir]/[basename]-[locale].[extension]",
                rowSeparatorRegex: '[\n\r\f]+',
                columnSeparatorChar: ',',
                columns: [
                    {
                        name: "id"
                    },
                    {
                        name: "name",
                        localizable: false
                    },
                    {
                        name: "description",
                        localizable: true
                    }
                ]
            },
            "**/*.tsv": {
                method: "copy",
                template: "[dir]/[basename]-[locale].[extension]",
                rowSeparatorRegex: '[\n\r\f]+',
                columnSeparatorChar: '\t'
            }
        }
    }
});

var cft = new CSVFileType(p);
var cft2 = new CSVFileType(p2);

module.exports.csvfile = {
    testCSVFileConstructor: function(test) {
        test.expect(1);

        var j = new CSVFile();
        test.ok(j);

        test.done();
    },

    testCSVFileConstructorParams: function(test) {
        test.expect(1);

        var j = new CSVFile({
            project: p,
            type: cft,
            pathName: "./testfiles/CSV/t1.csv"
        });

        test.ok(j);

        test.done();
    },

    testCSVFileConstructorNoFile: function(test) {
        test.expect(1);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        test.done();
    },

    testCSVFileConstructorInitWithColumns: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "bar",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        test.ok(j);

        test.deepEqual(j.columns, [
            {
                "name": "id"
            },
            {
                "name": "name",
                "localizable": true
            },
            {
                "name": "description",
                "localizable": true
            }
        ]);

        test.done();
    },

    testCSVFileConstructorInitWithContent: function(test) {
        test.expect(10);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "bar",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        test.ok(j);

        var record = j.records[0];

        test.equal(record.id, "foo");
        test.equal(record.name, "bar");
        test.equal(record.description, "asdf");

        record = j.records[1];

        test.equal(record.id, "foo2");
        test.equal(record.name, "bar2");
        test.equal(record.description, "asdf2");

        record = j.records[2];

        test.equal(record.id, "foo3");
        test.equal(record.name, "bar3");
        test.equal(record.description, "asdf3");

        test.done();
    },

    testCSVFileConstructorInitWithLocalizableColumns: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "bar",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        test.ok(j);

        test.deepEqual(j.localizable, new Set(["name", "description"]));

        test.done();
    },

    testCSVFileParseGetColumnNames: function(test) {
        test.expect(7);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            '23414,name1,description1\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\n' +
            '26234345,"name with quotes","description with quotes"\n' +
            '2345642,"quoted name with, comma in it","description with, comma in it"\n'
        );

        var columns = j.columns;

        test.equal(columns[0].name, "id");
        test.ok(columns[0].localizable);
        test.equal(columns[1].name, "name");
        test.ok(columns[1].localizable);
        test.equal(columns[2].name, "description");
        test.ok(columns[2].localizable);

        test.done();
    },

    testCSVFileParseRightRecords: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            '23414,name1,description1\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\n' +
            '26234345, "name with quotes", "description with quotes"\n' +
            '2345642, "quoted name with, comma in it", "description with, comma in it"\n'
        );

        var record = j.records[0];

        test.equal(record.id, "23414");
        test.equal(record.name, "name1");
        test.equal(record.description, "description1");

        test.done();
    },

    testCSVFileParseRightResourcesAllColumns: function(test) {
        test.expect(36);

        var j = new CSVFile({
            project: p,
            type: cft,
            pathName: "src/dir1/foo.csv"
        });
        test.ok(j);

        j.parse(
            'name,description\n' +
            'name1,description1\n' +
            'name2,description2 that has an escaped\\, comma in it\n' +
            '"name with quotes", "description with quotes"\n' +
            '"quoted name with, comma in it", "description with, comma in it"\n'
        );

        var set = j.getTranslationSet();
        test.ok(set);
        test.equal(set.size(), 8);

        var resources = set.getAll();
        test.equal(resources.length, 8);

        test.equal(resources[0].getType(), 'string');
        test.equal(resources[0].getKey(), 'name1');
        test.equal(resources[0].sourceLocale, 'en-US');
        test.equal(resources[0].getSource(), 'name1');

        test.equal(resources[1].getType(), 'string');
        test.equal(resources[1].getKey(), 'description1');
        test.equal(resources[1].sourceLocale, 'en-US');
        test.equal(resources[1].getSource(), 'description1');

        test.equal(resources[2].getType(), 'string');
        test.equal(resources[2].getKey(), 'name2');
        test.equal(resources[2].sourceLocale, 'en-US');
        test.equal(resources[2].getSource(), 'name2');

        test.equal(resources[3].getType(), 'string');
        test.equal(resources[3].getKey(), 'description2 that has an escaped, comma in it');
        test.equal(resources[3].sourceLocale, 'en-US');
        test.equal(resources[3].getSource(), 'description2 that has an escaped, comma in it');

        test.equal(resources[4].getType(), 'string');
        test.equal(resources[4].getKey(), 'name with quotes');
        test.equal(resources[4].sourceLocale, 'en-US');
        test.equal(resources[4].getSource(), 'name with quotes');

        test.equal(resources[5].getType(), 'string');
        test.equal(resources[5].getKey(), 'description with quotes');
        test.equal(resources[5].sourceLocale, 'en-US');
        test.equal(resources[5].getSource(), 'description with quotes');

        test.equal(resources[6].getType(), 'string');
        test.equal(resources[6].getKey(), 'quoted name with, comma in it');
        test.equal(resources[6].sourceLocale, 'en-US');
        test.equal(resources[6].getSource(), 'quoted name with, comma in it');

        test.equal(resources[7].getType(), 'string');
        test.equal(resources[7].getKey(), 'description with, comma in it');
        test.equal(resources[7].sourceLocale, 'en-US');
        test.equal(resources[7].getSource(), 'description with, comma in it');

        test.done();
    },

    testCSVFileParseRightResourcesOnlySomeColumns: function(test) {
        test.expect(20);

        var j = new CSVFile({
            project: p2,
            type: cft2,
            pathName: "src/dir1/foo.csv"
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            '23414,name1,description1\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\n' +
            '26234345, "name with quotes", "description with quotes"\n' +
            '2345642, "quoted name with, comma in it", "description with, comma in it"\n'
        );

        var set = j.getTranslationSet();
        test.ok(set);
        test.equal(set.size(), 4);

        var resources = set.getAll();
        test.equal(resources.length, 4);

        test.equal(resources[0].getType(), 'string');
        test.equal(resources[0].getKey(), 'description1');
        test.equal(resources[0].sourceLocale, 'en-US');
        test.equal(resources[0].getSource(), 'description1');

        test.equal(resources[1].getType(), 'string');
        test.equal(resources[1].getKey(), 'description2 that has an escaped, comma in it');
        test.equal(resources[1].sourceLocale, 'en-US');
        test.equal(resources[1].getSource(), 'description2 that has an escaped, comma in it');

        test.equal(resources[2].getType(), 'string');
        test.equal(resources[2].getKey(), 'description with quotes');
        test.equal(resources[2].sourceLocale, 'en-US');
        test.equal(resources[2].getSource(), 'description with quotes');

        test.equal(resources[3].getType(), 'string');
        test.equal(resources[3].getKey(), 'description with, comma in it');
        test.equal(resources[3].sourceLocale, 'en-US');
        test.equal(resources[3].getSource(), 'description with, comma in it');

        test.done();
    },

    testCSVFileParseEscapedComma: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            '23414,name1,description1\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\n' +
            '26234345, "name with quotes", "description with quotes"\n' +
            '2345642, "quoted name with, comma in it", "description with, comma in it"\n'
        );

        var record = j.records[1];

        test.equal(record.id, "754432");
        test.equal(record.name, "name2");
        test.equal(record.description, "description2 that has an escaped, comma in it");

        test.done();
    },

    testCSVFileParseTrimWhitespace: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            '    23414  ,   name1  ,   description1\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\n' +
            '26234345, "name with quotes", "description with quotes"\n' +
            '2345642, "quoted name with, comma in it", "description with, comma in it"\n'
        );

        var record = j.records[0];

        test.equal(record.id, "23414");
        test.equal(record.name, "name1");
        test.equal(record.description, "description1");

        test.done();
    },

    testCSVFileParseQuotedValues: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            '23414,name1,description1\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\n' +
            '26234345,     "name with quotes"  ,     "description with quotes"   \n' +
            '2345642, "quoted name with, comma in it", "description with, comma in it"\n'
        );

        var record = j.records[2];

        test.equal(record.id, "26234345");
        test.equal(record.name, "name with quotes");
        test.equal(record.description, "description with quotes");

        test.done();
    },

    testCSVFileParseQuotedValuesWithCommas: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            '23414,name1,description1\n' +
            '754432,name2,description2 that has an escaped\, comma in it\n' +
            '26234345,     "name with quotes"  ,     "description with quotes"   \n' +
            '2345642, "quoted name with, comma in it", "description with, comma in it"\n'
        );

        var record = j.records[3];

        test.equal(record.id, "2345642");
        test.equal(record.name, "quoted name with, comma in it");
        test.equal(record.description, "description with, comma in it");

        test.done();
    },

    testCSVFileParseQuotedValuesWithEmbeddedQuotes: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            '23414,name1,description1\n' +
            '754432,name2,description2 that has an escaped\, comma in it\n' +
            '26234345,     "name with quotes"  ,     "description with quotes"   \n' +
            '2345642, "quoted ""name"" has quotes", "description with no ""comma"" in it"\n'
        );

        var record = j.records[3];

        test.equal(record.id, "2345642");
        test.equal(record.name, "quoted \"name\" has quotes");
        test.equal(record.description, "description with no \"comma\" in it");

        test.done();
    },

    testCSVFileParseEmptyValues: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\n' +
            ',,description1\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\n' +
            '26234345,     "name with quotes"  ,     "description with quotes"   \n' +
            '2345642, "quoted name with, comma in it", "description with, comma in it"\n'
        );

        var record = j.records[0];

        test.equal(record.id, "");
        test.equal(record.name, "");
        test.equal(record.description, "description1");

        test.done();
    },

    testCSVFileParseMissingValues: function(test) {
        test.expect(6);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description,comments,user\n' +
            ',,description1\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\n' +
            '26234345,     "name with quotes"  ,     "description with quotes"   \n' +
            '2345642, "quoted name with, comma in it", "description with, comma in it"\n'
        );

        var record = j.records[0];

        test.equal(record.id, "");
        test.equal(record.name, "");
        test.equal(record.description, "description1");
        test.equal(record.comments, "");
        test.equal(record.user, "");

        test.done();
    },

    testCSVFileParseWithTabSeparator: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t'
        });
        test.ok(j);

        j.parse(
            'id\tname\tdescription\n' +
            '23414\tname1\tdescription1\n' +
            '754432tname2\tdescription2 that has an escaped\\\t tab in it\n' +
            '26234345\t     "name with quotes"  \t     "description with quotes"   \n' +
            '2345642\t "quoted name with\t tab in it" \t "description with\t tab in it"\n'
        );

        var record = j.records[0];

        test.equal(record.id, "23414");
        test.equal(record.name, "name1");
        test.equal(record.description, "description1");

        test.done();
    },

    testCSVFileParseMissingValuesWithTabsRightLength: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t'
        });
        test.ok(j);

        j.parse(
            'id\tname\tdescription\tcomments\tuser\n' +
            '32342\t\t\tcomments1\t\n' +
            '754432\tname2\tdescription2 that has an escaped\\t     tab in it\t\t\n' +
            '26234345\t"name with quotes"\t"description with quotes"\t\t\n' +
            '2345642\t"quoted name with, comma in it"\t"description with, comma in it"\t\t\n'
        );

        // 4 records and a header... the header doesn't count
        test.equal(j.records.length, 4);

        test.done();
    },

    testCSVFileParseMissingValuesWithTabs: function(test) {
        test.expect(21);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t'
        });
        test.ok(j);

        j.parse(
            'id\tname\tdescription\tcomments\tuser\n' +
            '32342\t\t\tcomments1\t\n' +
            '754432\tname2\tdescription2 that has an escaped\\t     tab in it\t\t\n' +
            '26234345\t"name with quotes"\t"description with quotes"\t\t\n' +
            '2345642\t"quoted name with, comma in it"\t"description with, comma in it"\t\t\n'
        );

        var record = j.records[0];

        test.equal(record.id, "32342");
        test.equal(record.name, "");
        test.equal(record.description, "");
        test.equal(record.comments, "comments1");
        test.equal(record.user, "");

        record = j.records[1];

        test.equal(record.id, "754432");
        test.equal(record.name, "name2");
        test.equal(record.description, "description2 that has an escaped\\t     tab in it");
        test.equal(record.comments, "");
        test.equal(record.user, "");

        record = j.records[2];

        test.equal(record.id, "26234345");
        test.equal(record.name, "name with quotes");
        test.equal(record.description, "description with quotes");
        test.equal(record.comments, "");
        test.equal(record.user, "");

        record = j.records[3];

        test.equal(record.id, "2345642");
        test.equal(record.name, "quoted name with, comma in it");
        test.equal(record.description, "description with, comma in it");
        test.equal(record.comments, "");
        test.equal(record.user, "");

        test.done();
    },

    testCSVFileParseEscapedTab: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t'
        });
        test.ok(j);

        j.parse(
            'id\tname\tdescription\n' +
            '23414\tname1\tdescription1\n' +
            '754432\tname2\tdescription2 that has an escaped\\\t tab in it\n' +
            '26234345\t     "name with quotes"  \t     "description with quotes"   \n' +
            '2345642\t "quoted name with\t tab in it" \t "description with\t tab in it"\n'
        );

        var record = j.records[1];

        test.equal(record.id, "754432");
        test.equal(record.name, "name2");
        test.equal(record.description, "description2 that has an escaped\t tab in it");

        test.done();
    },

    testCSVFileParseQuotedValuesTabSeparator: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t'
        });
        test.ok(j);

        j.parse(
            'id\tname\tdescription\n' +
            '23414\tname1\tdescription1\n' +
            '754432tname2\tdescription2 that has an escaped\\\t tab in it\n' +
            '26234345\t     "name with quotes"  \t     "description with quotes"   \n' +
            '2345642\t "quoted name with\t tab in it" \t "description with\t tab in it"\n'
        );

        var record = j.records[2];

        test.equal(record.id, "26234345");
        test.equal(record.name, "name with quotes");
        test.equal(record.description, "description with quotes");

        test.done();
    },

    testCSVFileParseWithTabSeparatorQuotedTabs: function(test) {
        test.expect(4);

        var j = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t'
        });
        test.ok(j);

        j.parse(
            'id\tname\tdescription\n' +
            '23414\tname1\tdescription1\n' +
            '754432tname2\tdescription2 that has an escaped\\\t tab in it\n' +
            '26234345\t     "name with quotes"  \t     "description with quotes"   \n' +
            '2345642\t "quoted name with\t tab in it" \t "description with\t tab in it"\n'
        );

        var record = j.records[3];

        test.equal(record.id, "2345642");
        test.equal(record.name, "quoted name with\t tab in it");
        test.equal(record.description, "description with\t tab in it");

        test.done();
    },

    testCSVFileParseDOSFile: function(test) {
        test.expect(4);

        // should work with default options
        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        j.parse(
            'id,name,description\r\n' +
            '23414,name1,description1\r\n' +
            '754432,name2,description2 that has an escaped\\, comma in it\r\n' +
            '26234345,     "name with quotes"  ,     "description with quotes"   \r\n' +
            '2345642, "quoted name with, comma in it" , "description with, comma in it"\r\n'
        );

        var record = j.records[3];

        test.equal(record.id, "2345642");
        test.equal(record.name, "quoted name with, comma in it");
        test.equal(record.description, "description with, comma in it");

        test.done();
    },

    testCSVFileExtractFile: function(test) {
        test.expect(6);

        var j = new CSVFile({
            project: p,
            type: cft,
            pathName: "./csv/t1.tsv",
            columnSeparator: '\t'
        });
        test.ok(j);

        // should read the file
        j.extract();

        test.equal(j.records.length, 3);

        var record = j.records[2];

        test.equal(record.id, "10003");
        test.equal(record.category, "flavor");
        test.equal(record.name, "strawberry");
        test.equal(record["name translation"], "fraisa");

        test.done();
    },

    testCSVFileExtractUndefinedFile: function(test) {
        test.expect(3);

        var j = new CSVFile({
            project: p,
            type: cft
        });
        test.ok(j);

        // should attempt to read the file and not fail
        j.extract();

        test.ok(j.records);
        test.equal(j.records.length, 0);

        test.done();
    },

    testCSVFileExtractBogusFile: function(test) {
        test.expect(3);

        var j = new CSVFile({
            project: p,
            type: cft,
            pathName: "./csv/foo.csv"
        });

        test.ok(j);

        // should attempt to read the file and not fail
        j.extract();

        test.ok(j.records);
        test.equal(j.records.length, 0);

        test.done();
    },

    testCSVFileLocalizeTextNoTranslations: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "bar",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        test.ok(j);

        var translations = new TranslationSet();

        var text = j.localizeText(translations, "en-US");

        test.equal(text,
            "id,name,description\n" +
            "foo,bar,asdf\n" +
            "foo2,bar2,asdf2\n" +
            "foo3,bar3,asdf3"
        );

        test.done();
    },

    testCSVFileLocalizeTextWithCommasInIt: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "bar,asdf",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "comma, comma",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "line3",
                    description: "down doo be doo, down down"
                }
            ]
        });
        test.ok(j);

        var translations = new TranslationSet();

        var text = j.localizeText(translations, "en-US");

        test.equal(text,
            'id,name,description\n' +
            'foo,"bar,asdf",asdf\n' +
            'foo2,"comma, comma",asdf2\n' +
            'foo3,line3,"down doo be doo, down down"'
        );

        test.done();
    },

    testCSVFileLocalizeTextWithQuotesInIt: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "bar,asdf",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "comma \"comma\" comma",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "line3",
                    description: "down doo be doo, down down"
                }
            ]
        });
        test.ok(j);

        var translations = new TranslationSet();

        var text = j.localizeText(translations, "en-US");

        test.equal(text,
            'id,name,description\n' +
            'foo,"bar,asdf",asdf\n' +
            'foo2,"comma ""comma"" comma",asdf2\n' +
            'foo3,line3,"down doo be doo, down down"'
        );

        test.done();
    },

    testCSVFileLocalizeTextWithWhitespace: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "   bar asdf   ",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "    comma \"comma\" comma   ",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "   line3",
                    description: "  down doo be doo, down down   "
                }
            ]
        });
        test.ok(j);

        var translations = new TranslationSet();

        var text = j.localizeText(translations, "en-US");

        test.equal(text,
            'id,name,description\n' +
            'foo,"   bar asdf   ",asdf\n' +
            'foo2,"    comma ""comma"" comma   ",asdf2\n' +
            'foo3,"   line3","  down doo be doo, down down   "'
        );

        test.done();
    },

    testCSVFileLocalizeTextWithTabs: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            rowSeparator: ':',
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "bar",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        test.ok(j);

        var translations = new TranslationSet();

        var text = j.localizeText(translations, "en-US");

        test.equal(text,
            "id\tname\tdescription:" +
            "foo\tbar\tasdf:" +
            "foo2\tbar2\tasdf2:" +
            "foo3\tbar3\tasdf3"
        );

        test.done();
    },

    testCSVFileLocalizeTextWithMissingFields: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "type"
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    type: "noun",
                    description: "asdf3"
                }
            ]
        });
        test.ok(j);

        var translations = new TranslationSet();

        var text = j.localizeText(translations, "en-US");

        test.equal(text,
            "id,name,type,description\n" +
            "foo,,,asdf\n" +
            "foo2,bar2,,asdf2\n" +
            "foo3,bar3,noun,asdf3"
        );

        test.done();
    },

    testCSVFileLocalizeTextWithMissingFieldsWithTabs: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "type"
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            columnSeparator: '\t',
            records: [
                {
                    id: "foo",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    type: "noun",
                    description: "asdf3"
                }
            ]
        });
        test.ok(j);

        var translations = new TranslationSet();

        var text = j.localizeText(translations, "en-US");

        test.equal(text,
            "id\tname\ttype\tdescription\n" +
            "foo\t\t\tasdf\n" +
            "foo2\tbar2\t\tasdf2\n" +
            "foo3\tbar3\tnoun\tasdf3"
        );

        test.done();
    },

    testCSVFileLocalizeTextWithTranslations: function(test) {
        test.expect(2);

        var j = new CSVFile({
            project: p,
            type: cft,
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            records: [
                {
                    id: "foo",
                    name: "bar",
                    description: "asdf"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        test.ok(j);

        var translations = new TranslationSet();
        translations.add(new ResourceString({
            project: "foo",
            key: "bar",
            source: "bar",
            sourceLocale: "en-US",
            target: "le bar",
            targetLocale: "fr-FR",
            datatype: "x-csv"
        }));
        translations.add(new ResourceString({
            project: "foo",
            key: "asdf",
            source: "asdf",
            sourceLocale: "en-US",
            target: "l'asdf",
            targetLocale: "fr-FR",
            datatype: "x-csv"
        }));
        translations.add(new ResourceString({
            project: "foo",
            key: "bar2",
            source: "bar2",
            sourceLocale: "en-US",
            target: "le bar2",
            targetLocale: "fr-FR",
            datatype: "x-csv"
        }));
        translations.add(new ResourceString({
            project: "foo",
            key: "asdf2",
            source: "asdf2",
            sourceLocale: "en-US",
            target: "l'asdf2",
            targetLocale: "fr-FR",
            datatype: "x-csv"
        }));
        translations.add(new ResourceString({
            project: "foo",
            key: "bar3",
            source: "bar3",
            sourceLocale: "en-US",
            target: "le bar3",
            targetLocale: "fr-FR",
            datatype: "x-csv"
        }));
        translations.add(new ResourceString({
            project: "foo",
            key: "asdf3",
            source: "asdf3",
            sourceLocale: "en-US",
            target: "l'asdf3",
            targetLocale: "fr-FR",
            datatype: "x-csv"
        }));

        var text = j.localizeText(translations, "fr-FR");

        test.equal(text,
            "id,name,description\n" +
            "foo,le bar,l'asdf\n" +
            "foo2,le bar2,l'asdf2\n" +
            "foo3,le bar3,l'asdf3"
        );

        test.done();
    },

    testCSVFileMergeColumnNamesSameNamesSameLength: function(test) {
        test.expect(5);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo4",
                    name: "bar4",
                    description: "asdf4"
                },
                {
                    id: "foo5",
                    name: "bar5",
                    description: "asdf5"
                },
                {
                    id: "foo6",
                    name: "bar6",
                    description: "asdf6"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        test.equal(csv1.columns.length, 3);
        test.equal(csv2.columns.length, 3);

        csv1.merge(csv2);

        test.equal(csv1.columns.length, 3);

        test.done();
    },

    testCSVFileMergeColumnNamesAddColumn: function(test) {
        test.expect(5);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                },
                {
                    "name": "foo",
                }
            ],
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                },
                {
                    "name": "foo",
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo4",
                    name: "bar4",
                    description: "asdf4",
                    foo: "asdf"
                },
                {
                    id: "foo5",
                    name: "bar5",
                    description: "asdf5",
                    foo: "asdf"
                },
                {
                    id: "foo6",
                    name: "bar6",
                    description: "asdf6",
                    foo: "asdf"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        test.equal(csv1.columns.length, 3);
        test.equal(csv2.columns.length, 4);

        csv1.merge(csv2);

        test.equal(csv1.columns.length, 4);

        test.done();
    },

    testCSVFileMergeColumnNamesAddColumnRightNames: function(test) {
        test.expect(4);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                },
                {
                    "name": "foo",
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo4",
                    name: "bar4",
                    description: "asdf4",
                    foo: "asdf"
                },
                {
                    id: "foo5",
                    name: "bar5",
                    description: "asdf5",
                    foo: "asdf"
                },
                {
                    id: "foo6",
                    name: "bar6",
                    description: "asdf6",
                    foo: "asdf"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        test.deepEqual(csv1.columns, [
            {
                "name": "id"
            },
            {
                "name": "name",
                "localizable": true
            },
            {
                "name": "description",
                "localizable": true
            }
        ]);

        csv1.merge(csv2);

        test.deepEqual(csv1.columns, [
            {
                "name": "id"
            },
            {
                "name": "name",
                "localizable": true
            },
            {
                "name": "description",
                "localizable": true
            },
            {
                "name": "foo",
            }
        ]);

        test.done();
    },

    testCSVFileMergeColumnNamesAddAndDeleteColumn: function(test) {
        test.expect(5);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "description",
                    "localizable": true
                },
                {
                    "name": "foo",
                }
            ],
            records: [
                {
                    id: "foo4",
                    description: "asdf4",
                    foo: "asdf"
                },
                {
                    id: "foo5",
                    description: "asdf5",
                    foo: "asdf"
                },
                {
                    id: "foo6",
                    description: "asdf6",
                    foo: "asdf"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        test.equal(csv1.columns.length, 3);
        test.equal(csv2.columns.length, 3);

        csv1.merge(csv2);

        test.equal(csv1.columns.length, 4);

        test.done();
    },

    testCSVFileMergeColumnNamesAddAndDeleteColumnRightNames: function(test) {
        test.expect(4);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "description",
                    "localizable": true
                },
                {
                    "name": "foo",
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo4",
                    description: "asdf4",
                    foo: "asdf"
                },
                {
                    id: "foo5",
                    description: "asdf5",
                    foo: "asdf"
                },
                {
                    id: "foo6",
                    description: "asdf6",
                    foo: "asdf"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        test.deepEqual(csv1.columns, [
            {
                "name": "id"
            },
            {
                "name": "name",
                "localizable": true
            },
            {
                "name": "description",
                "localizable": true
            }
        ]);

        csv1.merge(csv2);

        test.deepEqual(csv1.columns, [
            {
                "name": "id"
            },
            {
                "name": "name",
                "localizable": true
            },
            {
                "name": "description",
                "localizable": true
            },
            {
                "name": "foo",
            }
        ]);

        test.done();
    },

    testCSVFileMergeRightSize: function(test) {
        test.expect(6);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo4",
                    name: "bar4",
                    description: "asdf4"
                },
                {
                    id: "foo5",
                    name: "bar5",
                    description: "asdf5"
                },
                {
                    id: "foo6",
                    name: "bar6",
                    description: "asdf6"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        test.equal(csv1.records.length, 3);
        test.equal(csv2.records.length, 3);

        csv1.merge(csv2);

        test.equal(csv1.records.length, 6);
        test.equal(csv2.records.length, 3);

        test.done();
    },

    testCSVFileMergeRightContent: function(test) {
        test.expect(21);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
             columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo4",
                    name: "bar4",
                    description: "asdf4"
                },
                {
                    id: "foo5",
                    name: "bar5",
                    description: "asdf5"
                },
                {
                    id: "foo6",
                    name: "bar6",
                    description: "asdf6"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        csv1.merge(csv2);

        test.equal(csv1.records.length, 6);

        for (var i = 1; i < 7; i++) {
            test.equal(csv1.records[i-1].id, "foo" + i);
            test.equal(csv1.records[i-1].name, "bar" + i);
            test.equal(csv1.records[i-1].description, "asdf" + i);
        }
        test.done();
    },

    testCSVFileMergeWithOverwrites: function(test) {
        test.expect(12);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar4",
                    description: "asdf4"
                },
                {
                    id: "foo2",
                    name: "bar5",
                    description: "asdf5"
                },
                {
                    id: "foo3",
                    name: "bar6",
                    description: "asdf6"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        csv1.merge(csv2);

        test.equal(csv1.records.length, 3);

        for (var i = 1; i < 4; i++) {
            test.equal(csv1.records[i-1].id, "foo" + i);
            test.equal(csv1.records[i-1].name, "bar" + (i+3));
            test.equal(csv1.records[i-1].description, "asdf" + (i+3));
        }
        test.done();
    },

    testCSVFileMergeWithSomeOverwritesAndDifferentSchema: function(test) {
        test.expect(19);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "description",
                    "localizable": true
                },
                {
                    "name": "type",
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    description: "asdf4",
                    type: "foo1"
                },
                {
                    id: "foo4",
                    description: "asdf5",
                    type: "foo4"
                },
                {
                    id: "foo3",
                    description: "asdf6",
                    type: "foo3"
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        csv1.merge(csv2);

        test.equal(csv1.records.length, 4);

        test.equal(csv1.records[0].id, "foo1");
        test.equal(csv1.records[0].name, "bar1");
        test.equal(csv1.records[0].description, "asdf4");
        test.equal(csv1.records[0].type, "foo1");

        test.equal(csv1.records[1].id, "foo2");
        test.equal(csv1.records[1].name, "bar2");
        test.equal(csv1.records[1].description, "asdf2");
        test.ok(!csv1.records[1].type);

        test.equal(csv1.records[2].id, "foo3");
        test.equal(csv1.records[2].name, "bar3");
        test.equal(csv1.records[2].description, "asdf6");
        test.equal(csv1.records[2].type, "foo3");

        test.equal(csv1.records[3].id, "foo4");
        test.ok(!csv1.records[3].name);
        test.equal(csv1.records[3].description, "asdf5");
        test.equal(csv1.records[3].type, "foo4");

        test.done();
    },

    testCSVFileMergeWithOverwritesButDontOverwriteWithEmptyOrNull: function(test) {
        test.expect(12);

        var csv1 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "bar1",
                    description: "asdf1"
                },
                {
                    id: "foo2",
                    name: "bar2",
                    description: "asdf2"
                },
                {
                    id: "foo3",
                    name: "bar3",
                    description: "asdf3"
                }
            ]
        });
        var csv2 = new CSVFile({
            project: p,
            type: cft,
            columnSeparator: '\t',
            columns: [
                {
                    "name": "id"
                },
                {
                    "name": "name",
                    "localizable": true
                },
                {
                    "name": "description",
                    "localizable": true
                }
            ],
            key: "id",
            records: [
                {
                    id: "foo1",
                    name: "",
                    description: ""
                },
                {
                    id: "foo2",
                    name: null,
                    description: null
                },
                {
                    id: "foo3",
                    name: undefined,
                    description: undefined
                }
            ]
        });
        test.ok(csv1);
        test.ok(csv2);

        csv1.merge(csv2);

        test.equal(csv1.records.length, 3);

        // none of the fields should be overridden
        for (var i = 1; i < 4; i++) {
            test.equal(csv1.records[i-1].id, "foo" + i);
            test.equal(csv1.records[i-1].name, "bar" + i);
            test.equal(csv1.records[i-1].description, "asdf" + i);
        }
        test.done();
    }
};
