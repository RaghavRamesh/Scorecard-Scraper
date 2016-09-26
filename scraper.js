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

// Parse argument
var url = process.argv[2];

// Extract fall of wickets
scrapeFallOfWickets(url, function(err, data)  {
  // Process FoW into a JSON
  var str = data.replace('Fall of wickets: ', '').replace('Fall of wickets: ', '').replace('2nd Innings :', '');
  var empty;
  var strs = str.split('\r\n');
  for (var i = 0; i < strs.length; i++) {
    strs[i] = strs[i].trim();
    if (strs[i] == '')
      empty = i;
  }
  strs.splice(empty, 1);

  var fallOfWicketsTeam1 = strs[0].split(',');
  var fallOfWicketsTeam2 = strs[1].split(',');
  fallOfWicketsTeam1.splice(fallOfWicketsTeam1.length - 1, 1);
  fallOfWicketsTeam2.splice(fallOfWicketsTeam2.length - 1, 1);

  var team1FoWJSON = [];
  var team2FoWJSON = [];
  for (var i = 0; i < fallOfWicketsTeam1.length; i++) {
    var obj = {};
    obj[i+1] = {
      'score': fallOfWicketsTeam1[i].split('(')[0],
      'over': fallOfWicketsTeam1[i].match('[0-9]+.[0-9] (ov)')[0],
      'name': fallOfWicketsTeam1[i].split('(')[1].replace(/[0-9]+.[0-9] (ov)\)/g, '')
    };
    team1FoWJSON.push(obj);
  }
  console.log(team1FoWJSON);
  for (var i = 0; i < fallOfWicketsTeam2.length; i++) {
    var obj = {};
    obj[i+1] = {
      'score': fallOfWicketsTeam2[i].split('(')[0],
      'over': fallOfWicketsTeam2[i].match('[0-9]+.[0-9] (ov)')[0],
      'name': fallOfWicketsTeam2[i].split('(')[1].replace(/[0-9]+.[0-9] (ov)\)/g, '')
    };
    team2FoWJSON.push(obj);
  }
  console.log(team2FoWJSON);

  // Compute partnership from batsman list and fall of wickets
  // Find final format of data that is useful
});
