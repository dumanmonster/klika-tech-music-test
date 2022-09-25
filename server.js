const express = require('express');
const bodyParser = require('body-parser');
const mockData = require('./MOCK_DATA');
const cors = require('cors')
const defaultPage = 1;
const tracksPerPageByDefault = 10;

const app = express();


app.use(cors());
app.use(express.static(__dirname + '/dist'));
app.use(bodyParser.json());

// We use POST because of several retrieval conditions (filter, sort, page and tracksPerPage).
app.post('/tracks', function (req, res) {
    const filterBy = req.body.filterBy;
    const sortBy = req.body.sortBy;
    const page = req.body.page || defaultPage;
    const tracksPerPage = req.body.tracksPerPage || tracksPerPageByDefault;


    let tracks = {};
    try {
         tracks = retrievePage(page, tracksPerPage, filterBy, sortBy);
    } catch (error) {
        console.log(error); // TODO: Add logs.
        return res.sendStatus(500);
    }

    res.json(tracks);
});

app.get('/filter-values', function (req, res) {
    let properties = req.query.properties;

    if (typeof properties === 'string') {
        properties = [properties];
    }

    if (!(properties instanceof Array)) {
        return res.sendStatus(400);
    }

    const result = getValuesForFilter(properties);

    res.json(result);
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, function () {
    console.log(`Server is up and running. Port: ${PORT}`);
});



function retrievePage(page, tracksPerPage, filterBy, sortBy) {
    let tracks = mockData;

    tracks = filterTracks(filterBy, tracks);
    tracks = sortTracks(sortBy, tracks);

    let pagesCount = Math.ceil(tracks.length / tracksPerPage);

    let startIndex = (page - 1) * tracksPerPage;
    let endIndex = startIndex + tracksPerPage;

    tracks = tracks.slice(startIndex, endIndex);

    return {
        pagesCount: pagesCount,
        tracks: tracks
    };
}

function filterTracks(filterBy, result) {
    if (typeof filterBy !== 'object' || filterBy === null) {
        return result;
    }

    for (let property in filterBy) {
        if (!filterBy.hasOwnProperty(property)) {
            return result;
        }

        result = result.filter(function (track) {
            if (typeof track[property] === 'string') {
                return filterBy[property].toLowerCase() === track[property].toLowerCase();
            } else if (typeof track[property] === 'number') {
                return +filterBy[property] === track[property];
            }

            return true;
        });
    }

    return result;
}

function sortTracks(sortBy, result) {
    if (!sortBy) {
        return result;
    }

    result.sort(function (firstTrack, secondTrack) {
        let comparisonResult = typeof firstTrack[sortBy.property] === 'string'
            ? firstTrack[sortBy.property].localeCompare(secondTrack[sortBy.property])
            : firstTrack[sortBy.property] - secondTrack[sortBy.property];

        return sortBy.asc ? comparisonResult : comparisonResult * (-1);
    });

    return result;
}

function getValuesForFilter(properties) {
    const result = [];

    properties.forEach(function (property) {
        let values = mockData
            .map(function (track) {
                return track[property];
            })
            .filter(function (item, position, array) { // Remove duplicates.
                return array.indexOf(item) === position;
            });

        result.push({
            property: property,
            values: values
        });
    });

    return result;
}