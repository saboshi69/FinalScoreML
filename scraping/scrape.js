const bodyParser = require('body-parser')
//const express = require('express')
const request = require('request')
const fs = require('fs')
const fetch = require('node-fetch')
const puppeteer = require('puppeteer');


let testDate2 = [
    [20160101, 20160131],
    [20160201, 20160229],
    [20160301, 20160331]
]


class Service {
    constructor() {}
    getPage(data) {
        return new Promise((resolve, reject) => {
            let page = Math.ceil(parseInt(data[0].matchescount) / 20)
            resolve(page)
        })

    }

    copyData(data) {
        return new Promise((resolve, reject) => {
            let sData = JSON.stringify(data)
            fs.writeFile('data.json', sData, 'utf8', (err) => {
                if (err) {
                    console.log("Cannot write data.json")
                } else {
                    console.log("Successfully create data.json")
                    resolve(latestData)
                }
            })
        })
    }
}

let service = new Service;

async function getInit(url) {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page._client.send('Network.getCookies');
    await page.goto(url);
    await page.waitFor(2500);
    const result = await page.evaluate(() => {
        let data = document.querySelector('body pre').innerText;
        return {
            data
        }
    });
    await browser.close();
    return result;
};



const grab = async (dateArr) => {
    let months = dateArr.length
    let results = []
    for (let i = 0; i < months; i++) {
        let startDate = dateArr[i][0]
        let endDate = dateArr[i][1]
        let page = 1
        //let defaultUrl = `https://bet.hkjc.com/football/getJSON.aspx?jsontype=search_result.aspx&startdate=${startDate}&enddate=${endDate}&teamid=default`
        let url = `https://bet.hkjc.com/football/getJSON.aspx?jsontype=search_result.aspx&startdate=${startDate}&enddate=${endDate}&teamid=default&pageno=${page}`
        console.log("now scarping: " + url)
        await getInit(url)
            .then((data) => {
                let jD = data.data
                let jDa = JSON.parse(jD)
                console.log(jDa[0].matchescount)
            })
    }
}

grab(testDate2)