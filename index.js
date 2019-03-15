var AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';

const db = new AWS.DynamoDB();
db.listTables((err, data) => {
    console.log(data.TableNames);
    downloadData();
})

function downloadData() {
    var s3 = new AWS.S3();
    var params = {Bucket:`lab-data-isaac`, Key: 'lab-data/test-table-items.json'}
    s3.getObject(params, function(error, data) {
        if(error) {
            console.log(error)
        } else {
            const dataJSON = JSON.parse(data.Body);
            console.log(JSON.stringify(dataJSON))
            writeDynamoDB(dataJSON)
        }
    })
}

function writeDynamoDB(dataJSON) {
    var params = {RequestItems: dataJSON};
    db.batchWriteItem(params, function(err, data) {
        if(err) console.log(err, err.stack)
        else {
            console.log(data);
            queryDynamoDB();
        }
    })
}

function queryDynamoDB() {
    const params = {
        TableName: 'test-table', /* required */
        IndexName: 'ProductCategory-Price-index',
        KeyConditions: {
            "ProductCategory": {
                "AttributeValueList": [{ "S": "Bike" }],
                "ComparisonOperator": "EQ"
            },
            "Price": {
                "AttributeValueList": [{ "N": "300" }],
                "ComparisonOperator": "LE"
            }
        }
    };
    db.query(params, function(err, data) {
        if (err) console.log(err, data)
        else console.log(data.items)
    })
}