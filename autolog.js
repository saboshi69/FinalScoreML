const puppeteer = require('puppeteer');
require('dotenv').config()



const autoLog = async (bets)=> {
    const viewPort = {
        width: 1280,
        height: 960
    };
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page._client.send('Network.getCookies');
    await page.setViewport(viewPort);
    await page.goto('https://bet.hkjc.com/football/default.aspx');
    await page.waitFor(6000);
    const frame = await page.frames().find(frame => frame.name() === 'betSlipFrame'); // find the login-in iFrame
    const info = await page.frames().find(frame => frame.name() === 'info'); // find menu bar iFrame
    await frame.type('#account', process.env.DB_USER)
    await frame.type('#passwordInput1', process.env.DB_PASS)
    await frame.click('[id="pic_login"]') // click login after enter pw ac
    await page.waitFor(2000);
    const securityText = await frame.$eval('#ekbaSeqQuestion', element => element.textContent); // get securiy question 
    if (securityText == process.env.DB_Q1) {     // CHANGE YOUR OWN QUESTION
        await frame.type('#ekbaDivInput', process.env.DB_A1) // enter the answer
    } else if (securityText == process.env.DB_Q2) {
        await frame.type('#ekbaDivInput', process.env.DB_A2)
    } else {
        await frame.type('#ekbaDivInput', process.env.DB_A3)
    }
    await frame.click('[id="pic_confirm"]') // submit the answer
    await page.waitFor(2000);
    await frame.click('[id="btn_enter"]') // confirm understand terms and conditions
    await page.waitFor(1000);
    await info.click('[id="oMenuHAD"]') // click the odds for HDA
    await page.waitFor(2000);
    const hadInfo = await page.frames().find(frame => frame.name() === 'info')
    bets.forEach(async (row)=>{
        if (row[0] == "Home Win") {
           let tickBox = row[3] + "_HAD_H_0_c"
           await hadInfo.click(`[id="${tickBox}"]`)
           .catch(()=>{console.log("opps")})
        } else if (row[0] == "Draw") {
            let tickBox = row[3] + "_HAD_D_0_c"
            await hadInfo.click(`[id="${tickBox}"]`)
            .catch(()=>{console.log("opps")})
        }  else if (row[0] == "Away Win") {
            let tickBox = row[3] + "_HAD_A_0_c"
            await hadInfo.click(`[id="${tickBox}"]`)
            .catch(()=>{console.log("opps")})
        } 

    })
    await page.waitFor(60000);
    await browser.close();
};

module.exports = autoLog