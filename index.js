const fs = require('fs');
const axios = require('axios');

// Got the data from the api that you have provided. (One time only.)
/*
axios.get('https://api.github.com/repositories/19438/commits')
    .then(response => {
        const jsonData = response.data;
        const jsonString = JSON.stringify(jsonData, null, 2);

        // Write the JSON data to a file
        fs.writeFile('data.json', jsonString, 'utf8', (err) => {
            if (err) {
                console.log('Error writing file:', err);
            } else {
                console.log('JSON file retrieved and saved successfully!');
            }
        });
    })
    .catch(error => {
        console.log('Error retrieving JSON data:', error);
    });
*/

fs.readFile('data.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log('Error reading file:', err);
        return;
    }

    try {
        const data = JSON.parse(jsonString);

        const csvFirstData = extractFirstCSVData(data);
        const csvSecondData = extractSecondCSVData(data);
        const csvThirdData = extractThirdCSVData(data);

        const csvFirstString = convertToCSV(csvFirstData);
        const csvSecondString = convertToCSV(csvSecondData);
        const csvThirdString = convertToCSV(csvThirdData);

        // Write the CSV data to files.
        fs.writeFile('output1.csv', csvFirstString, 'utf8', (err) => {
            if (err) {
                console.log('Error writing file:', err);
            } else {
                console.log('CSV file generated successfully!');
            }
        });
        fs.writeFile('output2.csv', csvSecondString, 'utf8', (err) => {
            if (err) {
                console.log('Error writing file:', err);
            } else {
                console.log('CSV file generated successfully!');
            }
        });
        fs.writeFile('output3.csv', csvThirdString, 'utf8', (err) => {
            if (err) {
                console.log('Error writing file:', err);
            } else {
                console.log('CSV file generated successfully!');
            }
        });
    } catch (err) {
        console.log('Error parsing JSON string:', err);
    }
});

function extractFirstCSVData(data) {
    return data.map((item) => {
        return {
             username: item.author.login,
             avatar: item.author.avatar_url,
             homepage: item.author.url
         }
     });
}

async function extractSecondCSVData(data) {
    const followersUrls = data.map((item) => {
        return item.committer.followers_url
    })

    // filter out the duplicates and return only one of each.
    let uniqueUrls = [...new Set(followersUrls)];

    const responses = await Promise.all(uniqueUrls.map(url => axios.get(url)));
    const followers = responses.map(response => response.data);

    // Get the first five followers
    const firstFiveFollowers = followers.slice(0,5)
    return firstFiveFollowers.map((element) => {
        return element.login
    });
}

async function extractThirdCSVData(data) {
    return data.map(async (item) => {
        const repoUrl = item.html_url.split('/commit/')[0];

        const commentData = await axios.get(item.comments_url)
        const commentUrlArr = commentData.map(response => response.data);

        const lastComment = commentUrlArr[commentUrlArr.length - 1];
        const secondToLastComment = commentUrlArr[commentUrlArr.length - 2];

        return {
            repoUrl,
            lastComment,
            secondToLastComment
        }
    })
}

// Convert the data to CSV format
function convertToCSV(data) {
    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    return headers + rows;
}
