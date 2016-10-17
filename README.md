# Scorecard-Scraper

### What is it?
A script that scrapes a cricket scorecard given the URL and computes the batting `partnerships` of the match.

### But why?
`Partnership` is an important stat that aids the analysis of a team's performance in a cricket match. 

### How to run?
Run
```node scraper.js 'url'```

where 'url' is of format ['http://seasonedprosg.com/Scorecard2015?Live=0&id=1200'](http://seasonedprosg.com/Scorecard2015?Live=0&id=1200)

### Output
The script creates JSON files in ```./data/``` folder.
