const _ = require('lodash');
const odds = require('./data/data/odds');
const oddsExtra = require('./data/data/oddsExtra');
const getMatch = require('./getMatch')
const autolog = require('./autolog')
const inquirer = require('inquirer');


//calculate the absolute odds different betweeb what we try to look at vs. the real odds for the home team 
function dis(trainingOdds, testingOdds) {
    return _.chain(trainingOdds)
        .zip(testingOdds) //group arr1 =[a,b] arr2=[c,d] into [[a,c],[b,d]]
        .map(([a, b]) => (a - b) ** 2)
        .sum()
        .value() ** 0.5;
}

//see how many net goals are home team gonna win (or lose)
function netWinning(home, away) {
    return home - away
}

//read who win the match
function whoWin(home, away) {
    let net = home - away
    if (net > 0) {
        return "Home Win"
    } else if (net == 0) {
        return "Draw"
    } else {
        return "Away Win"
    }
}

function runIt(sample) {
    const testSetSize = 2000 //It is the test case size that u want to split from the orginal data set Math.floor(sample.length/2) 
    const coloumToNormalize = 2 // It will start from 0 to the no. that you pick
    const [testSet, trainingSet] = splitDataSet(normalizeData(sample, coloumToNormalize, false), testSetSize) //we just default false for data normalize becoz it give a worser acc
    // const testSet = _.filter(oddsExtra, row=> row[15]=="Eng Premier")
    // const trainingSet = odds
    //_.range(42).forEach((k) => { //recoment 42    un comment this to find optimize K 
    const k = 42 //to find and adjust k, uncomment above function
    let moneyInit = 1000
    let win = 0
    let lose = 0
    const acc = _.chain(testSet)
        .filter(testRow => {
            let expectedResult = knn(trainingSet, _.slice(testRow, 0, 3), k)
            let realResult = whoWin(testRow[11], testRow[12])
            if (expectedResult == realResult) {
                if (realResult == "Home Win") {
                    moneyInit += (testRow[0] - 1)* 10
                    win++
                } else if (realResult == "Draw") {
                    moneyInit += (testRow[2]-1) * 10
                    win++
                } else  {
                    moneyInit += (testRow[1]-1) * 10
                    win++
                } 
            } else if(expectedResult == "noGamble"){
                moneyInit = moneyInit * 1
                
            }else{
                moneyInit = moneyInit - 10
                lose++
            }
            console.log("Expected: " + expectedResult + " Real: " + realResult + " deposit: " + moneyInit + " win%: " + (win/(win+lose))*100+"% round: "+( win+lose))
            return expectedResult == realResult
        }) //note that now we assume knn distance takes three parameters, home, draw and away odds, so we slice that 3 parm out of the row, can change it 
        .size() //getting the length or the correct prediction
        .divide(testSetSize) //divdie corerct preditcion/testsetsize to find accarcy rate
        .value(); // finish chain 
    console.log("K level: " + k + " accuracy: " + acc)
    //})
}



function knn(training, targetOdds, k) {
    console.log("test odds HAD: " + targetOdds)
    let sorting = _.chain(training)
        .map(row => { //note that now we assume our distance takes three parameters, home, draw and away odds
            return [ //return follow 2 things for our knn to work
                dis(_.slice(row, 0, 3), targetOdds), //get absolute distance for each row of the odds, edit the slice to include more parameters
                whoWin(row[11], row[12])
            ] // get the training data result, who is winning
        })
        .sortBy(row => row[0])
        .slice(0, k)
        .countBy(row => row[1])
        .toPairs()
        .sortBy(row => row[1])
        .value()

    let winChance = _.chain(sorting)
        .map(row => row[1])
        .last()
        .divide(k)
    let result = _.chain(sorting)
        .last()
        .first()
        .value()


    if (winChance * expectedValue(result, targetOdds) > 1) {
        return "noGamble"
    }
    return result
}

function splitDataSet(data, testCount) { // it uses to spread the data into train set and test set
    const shuffled = _.shuffle(data)
    const testSet = _.slice(shuffled, 0, testCount)
    const trainingSet = _.slice(shuffled, testCount)
    return [testSet, trainingSet]
}

function normalizeData(dataArr, normGroup, useNorm) { //it uses to normalize the data so every param weight the same
    if (useNorm) {
        const cloneData = _.cloneDeep(dataArr)

        for (let i = 0; i < normGroup; i++) {
            const selectedColum = cloneData.map((row) => row[i]);
            const minValue = _.min(selectedColum)
            const maxValue = _.max(selectedColum)
            for (let j = 0; j < cloneData.length; j++) {
                cloneData[j][i] = (cloneData[j][i] - minValue) / (maxValue - minValue)
            }
        }
    }
    return dataArr
}

function knnForPerson(training, targetOdds, matchDetails) {
    let expectedValueFilter = false
    const k = 42 // default 42
    let sorting = _.chain(training)
        .map(row => { //note that now we assume our distance takes three parameters, home, draw and away odds
            return [ //return follow 2 things for our knn to work
                dis(_.slice(row, 0, 3), targetOdds), //get absolute distance for each row of the odds, edit the slice to include more parameters
                whoWin(row[11], row[12])
            ] // get the training data result, who is winning
        })
        .sortBy(row => row[0])
        .slice(0, k)
        .countBy(row => row[1])
        .toPairs()
        .sortBy(row => row[1])
        .value()

    let winChance = _.chain(sorting)
        .map(row => row[1])
        .last()
        .divide(k)
    let result = _.chain(sorting)
        .last()
        .first()
        //.parseInt()   //predict real score may need this
        .value()

    if (winChance * expectedValue(result, targetOdds) > 1 && expectedValueFilter == true ) {
        console.log("test odds HDA: " + targetOdds[0]+', '+ targetOdds[2]+', '+  targetOdds[1])
        console.log(result + ", Chances: " + winChance + ', Expected Value: ' + winChance * expectedValue(result, targetOdds))
        console.log(sorting + ', ' + matchDetails[3] + ', ' + matchDetails[4] + ', ' + matchDetails[5] + "\n")
    }else{
        console.log("test odds HDA: " + targetOdds[0]+', '+ targetOdds[2]+', '+  targetOdds[1])
        console.log(result + ", Chances: " + winChance + ', Expected Value: ' + winChance * expectedValue(result, targetOdds))
        console.log(sorting + ', ' + matchDetails[3] + ', ' + matchDetails[4] + ', ' + matchDetails[5] + "\n")
    }

    

    return result
}


function knnForAutoBet(training, targetOdds, matchDetails) {
    let expectedValueFilter = false
    const k = 42 // default 42
    let sorting = _.chain(training)
        .map(row => { //note that now we assume our distance takes three parameters, home, draw and away odds
            return [ //return follow 2 things for our knn to work
                dis(_.slice(row, 0, 3), targetOdds), //get absolute distance for each row of the odds, edit the slice to include more parameters
                whoWin(row[11], row[12])
            ] // get the training data result, who is winning
        })
        .sortBy(row => row[0])
        .slice(0, k)
        .countBy(row => row[1])
        .toPairs()
        .sortBy(row => row[1])
        .value()

    let winChance = _.chain(sorting)
        .map(row => row[1])
        .last()
        .divide(k)
    let result = _.chain(sorting)
        .last()
        .first()
        //.parseInt()   //predict real score may need this
        .value()


    return [result, matchDetails[3], matchDetails[4],matchDetails[6]]
}


function expectedValue(bool, testRow) {
    if (bool == "Home Win") {
        return testRow[0]
    } else if (bool == "Draw") {
        return testRow[2]
    } else {
        return testRow[1]
    }
}


function refreshTodayMatch() {
    getMatch()
        .then((el) => {
            el.map((e) => {
                knnForPerson(odds, _.slice(e, 0, 3), e)
            })
        })
}

async function autoBet() {
    let resultArr = []
    await getMatch()
        .then((el) => {
            el.map((e) => {
                let result = knnForAutoBet(odds, _.slice(e, 0, 3), e)
                resultArr.push(result)
            })
            autolog(resultArr)
        })
    console.log(resultArr)
}


inquirer.prompt([{
    name: 'choice',
    type: 'list',
    message: 'Please choose an action:'+ '\n'+'\n',
    choices: ['Predicts all matches that will start within 1 hour', 'Auto-login & Placing predicted Bet', 'Run back-test'],
    default: 2,
  }]).then((answers) => {
    if (answers.choice == 'Predicts all matches that will start within 1 hour'){
        console.log("You can change your own setting on getMatch.js")
        refreshTodayMatch()
    }else if(answers.choice == 'Auto-login & Placing predicted Bet'){
        console.log("Please change your own setting on Autolog.js")
        console.log("Only matches starting withing 1 hour will be placed")
        console.log("Browser will be closed in 1 minute")
        autoBet()
    }else{
        runIt(odds)
    }
  });
