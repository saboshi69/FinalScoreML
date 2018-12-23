const axios = require('axios');

const getMatch = async() => {
    let req = await axios.get('https://bet.hkjc.com/football/getJSON.aspx?jsontype=odds_had.aspx')
    let currentMatches = req.data[1]
    let formattedData = []
    if (currentMatches.name == "ActiveMatches") {
        let currentTime = Date.parse(new Date() +"+08:00")
        formattedData = currentMatches.matches.map((row) => {
            let matchTime = row.matchTime
            let matchTimeParse =  Date.parse(matchTime)
            if(diff_minutes(matchTimeParse, currentTime) < 60 && diff_minutes(matchTimeParse, currentTime) > 0){   //get all matches start in x hours /minties,  depends on diff_minutes()
                let hteamNameCH = row.homeTeam.teamNameCH
                let ateamNameCH = row.awayTeam.teamNameCH
                let home = row.hadodds.H
                let away = row.hadodds.A
                let draw = row.hadodds.D
                let had = [home,away,draw]
                let matchIDinofficial = row.matchIDinofficial
                had = had.map((el) => parseFloat(el.replace(/100@/, '')))
                result = [...had, hteamNameCH, ateamNameCH, matchTime, matchIDinofficial]
                return result
            }
        })
    }
    formattedData = formattedData.filter((el)=>el!= undefined)
    return formattedData
}

function diff_minutes(dtB, dtE) 
 {
  var diff =(dtB - dtE) / 1000/60; // difference in hours/1000/60/60   difference in minute /1000/60
  return Math.abs(Math.round(diff));  
 }


module.exports = getMatch;