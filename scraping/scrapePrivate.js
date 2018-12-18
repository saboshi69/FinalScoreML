const fs = require('fs')
const puppeteer = require('puppeteer');
const mydate = require('./periods')


async function getInit(url) {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page._client.send('Network.getCookies');
    await page.goto(url);
    await page.waitFor(6000);
    const result = await page.evaluate(() => {
        let data = document.querySelector('body pre').innerText;
        return {
            data
        }
    });
    await browser.close();
    return result;
};


//add catch block
const grab = async (dateArr) => {
    let months = dateArr.length
    let result = []
    for (let i = 0; i < months; i++) {
        console.log("this is loop cycle: " + i)
        let startDate = dateArr[i][0]
        let endDate = dateArr[i][1]
        let page = 1
        let url = `https://bet.hkjc.com/football/getJSON.aspx?jsontype=search_result.aspx&startdate=${startDate}&enddate=${endDate}&teamid=default&pageno=${page}`
        await getInit(url)
        .then(async (data) => {
            try{
                    let jD = data.data
                    let jDa = JSON.parse(jD)
                    let pages = Math.ceil(parseInt(jDa[0].matchescount) / 20)
                    for (let pp = 1, ppp = 1 ; pp < pages; pp++, ppp++) {
                        let urll = await `https://bet.hkjc.com/football/getJSON.aspx?jsontype=search_result.aspx&startdate=${startDate}&enddate=${endDate}&teamid=default&pageno=${ppp}`
                        let dd = await getInit(urll)
                        .catch(err => {
                            console.log(err)
                            console.log("err, ppp now: "+ ppp)
                            setTimeout(() => {                               
                                ppp--
                                console.log("retry, ppp -1: "+ppp)
                            }, 25000);
                        });
                        console.log("now scarping: " + urll)
                        let jjD = dd.data
                        let jjDa = JSON.parse(jjD)
                        jjDa[0].matches.forEach(async (r) => {
                            
                            if (r.accumulatedscore[1].away != -1) {
                                let home = r.hadodds.H
                                let away = r.hadodds.A
                                let draw = r.hadodds.D
                                let t0 = r.ttgodds.P0
                                let t1 = r.ttgodds.P1
                                let t2 = r.ttgodds.P2
                                let t3 = r.ttgodds.P3
                                let t4 = r.ttgodds.P4
                                let t5 = r.ttgodds.P5
                                let t6 = r.ttgodds.P6
                                let t7 = r.ttgodds.M7
                                let homeGoal = r.accumulatedscore[1].home
                                let awayGoal = r.accumulatedscore[1].away
                                let homeTeam = r.homeTeam.teamNameEN
                                let awayTeam = r.awayTeam.teamNameEN
                                let leagueName = r.league.leagueNameEN
                                let shortDivName = r.league.leagueShortName
                                let date = r.matchDate
                                result = [home, away, draw, t0, t1, t2, t3, t4, t5, t6, t7, homeGoal, awayGoal]
                                result = result.map((el) => parseFloat(el.replace(/100@/, '')))
                                result = [...result, homeTeam, awayTeam, leagueName, shortDivName, date]
                                await fs.appendFile(`./data/oddsData.json`, JSON.stringify(result) + ',', err => (err) ? console.log(err) : console.log(date + ': '+ r.matchID))
                            }
                        })
    
                    }
                }catch (err){
                    console.log(err)
                }
            })
        .catch((err)=>{
            console.log("oppos getInit(url) not working")
            console.log(err)
            setTimeout(() => {
                console.log("we are trying loop: "+ i)
                i--
                console.log("rollback one loop to loop: "+ i)
            }, 25000);
        })
    }
}

grab(mydate)