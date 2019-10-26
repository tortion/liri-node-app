require("dotenv").config();
var keys = require("./keys.js");
var fs = require("fs");
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify);
var request = require("request");
var moment = require("moment");

var command = process.argv[2];
var choice = "";

function displayUsage() {
    console.log("\n\nLiribot");
    console.log("-------");
    console.log("usage: liribot [command]\n");
    console.log("valid commands:\n")
    console.log("     movie-this         [movietitle]");
    console.log("     concert-this       [bandname]");
    console.log("     spotify-this-song  [songname]\n");
    console.log("     do-what-it-says");
    console.log("              ^--- include the command and argument in");
    console.log("                   a file named 'random.txt'\n");
}

function buildDashes(str,num) {

    var returnStr = "";
    for (i = 0; i < str[0].length + num; i++) {
        returnStr += "-";
    }
    return (returnStr);
}

function buildAshes(str,num) {

    var returnStr = "";
    for (i = 0; i < str.length + num; i++) {
        returnStr += "-";
    }
    return (returnStr);
}

function concert(artistName) {

    var queryUrl = "https://rest.bandsintown.com/artists/" + choice + "/events?app_id=" + process.env.B_key;
    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var result = JSON.parse(body);
            if (result.length) {
                for (var i = 0; i < result.length; i++) {
                    console.log("\nEvent: " + result[i].lineup);
                    var dashline = buildDashes(result[i].lineup,7);
                    console.log(dashline);
                    console.log("Date : " + moment(result[i].datetime).format("MM/DD/YYYY"));
                    console.log("Name : " + result[i].venue.name);
                    console.log("City : " + result[i].venue.city);
                    if (result[i].venue.region) {
                        console.log("State: " + result[i].venue.region + ", " + result[i].venue.country);
                    } else
                        console.log(result[i].venue.country);
                }
            }
            else
                console.log("\nNo events!");
        }
    })
}

function song(songName) {

    spotify.search({ type: "track", query: songName })
        .then(function (response) {
            var output = response.tracks.items;
            for (var i = 0; i < output.length; i++) {
                console.log("\nSong: '" + output[i].name + "'")
                var dashline = buildAshes(output[i].name,8)
                console.log(dashline)
                console.log("Artist: " + output[i].artists[0].name)
                console.log("Album : " + output[i].album.name);
                console.log("Link  : " + output[i].href)
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}

function movie(movieName) {

    var omdbURL = "http://www.omdbapi.com/?t=" + choice + "&y=&plot=short&apikey=trilogy"

    request(omdbURL, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            console.log("\nTitle: " + JSON.parse(body).Title);
            var dashline = buildAshes(JSON.parse(body).Title);
            console.log(dashline);
            console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
            console.log("Released in: " + JSON.parse(body).Year);
            var ratings = JSON.parse(body).Ratings;
            for (i = 0; i < ratings.length; i++) {
                if (ratings[i].Source == "Rotten Tomatoes") {
                    console.log("Rotten Tomatoes Rating: " + ratings[i].Value);
                }
            }
            console.log("\nProduced in: " + JSON.parse(body).Country);
            console.log("Languages  : " + JSON.parse(body).Language);
            console.log("Starring   : " + JSON.parse(body).Actors + "\n");
            console.log("Plot: " + JSON.parse(body).Plot);
        }

    })
}

function viaFile() {

    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            throw (error);
        }
        commandChoice = data.split(",");
        chooseFunction(commandChoice[0], commandChoice[1])
    })
}

function chooseFunction(command, choice) {

    switch (command) {
        case "spotify-this-song":
            if (!choice) choice = "The Sign";
            song(choice);
            break;

        case "concert-this": concert(choice);
            break;

        case "movie-this": movie(choice);
            break;

        default: displayUsage();
    }
}

// main - process orig command line and trim blanks
for (i = 3; i < process.argv.length; i++) {
    choice = choice + " " + process.argv[i];
}
choice = choice.trim();

// execute either disk read or passed in values
if (command == "do-what-it-says")
    var doThis = viaFile()
else
    chooseFunction(command, choice);


