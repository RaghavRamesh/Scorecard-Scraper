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
    var $ = cheerio.load(body), rawFallOfWickets, rawFinalScore, rawFinalOvers;

    // 3. Extract fall of wickets
    rawFallOfWickets = $('.table #match-general-info p:last-child').text();
    rawFinalScore = $('.table #match-general-info p:nth-child(5)').text();
    rawFinalOvers = $('.table #match-general-info p:nth-child(2)').text();
    // Send the data in the callback
    cb(null, rawFallOfWickets, rawFinalScore, rawFinalOvers);
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
scrapeFallOfWickets(url, function(err, data, finalScoreData, finalOverData)  {
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
    obj[i] = {
      'score': fallOfWicketsTeam1[i].split('(')[0].trim().split('-')[1],
      'over': fallOfWicketsTeam1[i].match('[0-9]+.[0-9] ')[0].trim(),
      'name': fallOfWicketsTeam1[i].split('(')[1].replace(/[0-9]+.[0-9] (ov)\)/g, '')
    };
    team1FoWJSON.push(obj);
  }
  // console.log(team1FoWJSON[0]['0']['score']);
  for (var i = 0; i < fallOfWicketsTeam2.length; i++) {
    var obj = {};
    obj[i] = {
      'score': fallOfWicketsTeam2[i].split('(')[0].trim().split('-')[1],
      'over': fallOfWicketsTeam2[i].match('[0-9]+.[0-9] ')[0].trim(),
      'name': fallOfWicketsTeam2[i].split('(')[1].replace(/[0-9]+.[0-9] (ov)\)/g, '')
    };
    team2FoWJSON.push(obj);
  }
  // console.log(team2FoWJSON);

  // Process final score and overs
  finalScoreData = finalScoreData.replace('Total Runs/Wickets : ', '').replace('Total Runs/Wickets : ', '').replace('\r\n', '');
  var finalScores = finalScoreData.split('\r\n');
  finalScores[0] = finalScores[0].trim();
  finalScores[1] = finalScores[1].trim();

  finalOverData = finalOverData.replace('Overs : ', '').replace(' Overs ', '').replace('Overs : ', '').replace(' Overs ', '').replace('\r\n', '').replace('1st Innings : Rain interrupted at 13.0 Overs, Match reduced to 20 overs', '');
  var finalOvers = finalOverData.split('\r\n');
  finalOvers[0] = finalOvers[0].trim();
  finalOvers[1] = finalOvers[1].trim();
  // console.log(finalOvers);

  scrapeBatsmenList(url, function(err, team1BatsmenList, team2BatsmenList) {
    // console.log(team1BatsmenList);

    var partnershipJSON = [], notout = '', out = '', runs = 0, i;
    for (i = 1; i <= team1FoWJSON.length; i++) {
      if (i == 1) {
        partnershipJSON.push({
          'batsmen': [team1BatsmenList[0], team1BatsmenList[1]],
          'runs': team1FoWJSON[i-1][i-1]['score'] - 0,
          'balls': convertOversToBalls(team1FoWJSON[i-1][i-1]['over']) - 0
        });
        out = team1FoWJSON[i-1][i-1]['name'];
        notout = (out == team1BatsmenList[0]) ? team1BatsmenList[1] : team1BatsmenList[0];
      } else {
        partnershipJSON.push({
          'batsmen': [notout, team1BatsmenList[i]],
          'runs': team1FoWJSON[i-1][i-1]['score'] - team1FoWJSON[i-2][i-2]['score'],
          'balls': convertOversToBalls(team1FoWJSON[i-1][i-1]['over']) - convertOversToBalls(team1FoWJSON[i-2][i-2]['over'])
        });
        out = team1FoWJSON[i-1][i-1]['name'];
        notout = (out == team1BatsmenList[i]) ? notout : team1BatsmenList[i];
      }
    }
    // TODO: Scrape final score and overs
    var team1FinalScore = finalScores[0].split('/')[0];
    var team1FinalOver = finalOvers[0];
    console.log(team1FinalOver);
    if (team1BatsmenList.length != 11) {
      partnershipJSON.push({
        'batsmen': [notout, team1BatsmenList[i]],
        'runs': parseInt(team1FinalScore) - team1FoWJSON[i-2][i-2]['score'],
        'balls': convertOversToBalls(team1FinalOver) - convertOversToBalls(team1FoWJSON[i-2][i-2]['over'])
      });
    }
    console.log(partnershipJSON);
  });

  // TODO: Find final format of data that is useful
});

function convertOversToBalls(overs) {
  var parts = overs.split('.');
  if (parts.length != 2)
    return parseInt(parts[0])*6;
  return parseInt(parts[0])*6 + parseInt(parts[1]);
}
