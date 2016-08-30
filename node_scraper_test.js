// Import the dependencies
var cheerio = require("cheerio")
  , req = require("tinyreq")
  ;

// Scrapes fall of wickets from an SPro Scorecard URL
function scrapeFallOfWickets(url, cb) {
  // 1. Request URL
  req(url, function(err, body) {
    if (err) { return cb(err); }

    // 2. Parse the HTML
    var $ = cheerio.load(body), rawFallOfWickets;

    // 3. Extract fall of wickets
    rawFallOfWickets = $('.table #match-general-info p:last-child').text();

    // Send the data in the callback
    cb(null, rawFallOfWickets);
    // cb(null, batsmenTeam1);
  });
}

function scrapeBatsmenList(url, cb) {
    // 1. Request URL
  req(url, function(err, body) {
    if (err) { return cb(err); }

    // 2. Parse the HTML
    var $ = cheerio.load(body);

    // 3. Extract batsmen
    var bowlerFlag = false, batsmenTeam1 = [], batsmenTeam2 = [], teamCounter = 0;

    $('.table table tbody tr th:nth-child(1),td:nth-child(1)').each(function(index, val) {
      if (val.children[0].data != 'Batsman' && bowlerFlag) {
        return true;
      } else {
        if (val.children[0].data == 'Batsman') {
          bowlerFlag = false;
          teamCounter++;
          return true;
        } else if (val.children[0].data == 'Bowler') {
          bowlerFlag = true;
          return true;
        }

        if (teamCounter == 1) {
          batsmenTeam1.push(val.children[0].data);
        } else {
          batsmenTeam2.push(val.children[0].data);
        }
      }
    });

    // Send the data in the callback
    cb(null, batsmenTeam1, batsmenTeam2);
  });
}

// Extract fall of wickets
scrapeFallOfWickets("http://seasonedprosg.com/Scorecard2015?Live=0&id=1252", function(err, data)  {
  console.log(err || data);
});

// scrapeBatsmenList("http://seasonedprosg.com/Scorecard2015?Live=0&id=1252", function(err, team1, team2)  {
//   console.log(team1);
//   console.log(team2);
// });

// Compute partnership from batsman list and fall of wickets
// Set URL as param instead of hardcoding
// Find final format of data that is useful

