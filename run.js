const _ = require('lodash');
const samples2 = require('./scraping/data/samples2');
const odds = require('./scraping/data/odds');

//calculate the absolute odds different betweeb what we try to look at vs. the real odds for the home team 
function dis(trainingOdds, testingOdds) {
    return _.chain(trainingOdds)
    .zip(testingOdds) //group arr1 =[a,b] arr2=[c,d] into [[a,c],[b,d]]
    .map(([a,b])=>(a-b)**2)
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
    const testSetSize = 1000 //Math.floor(sample.length/2)
    const [testSet, trainingSet] = splitDataSet(sample, testSetSize)
    _.range(42, 100).forEach((k) => { //recoment 42
        const acc = _.chain(testSet)
            .filter(testRow => knn(trainingSet, _.slice(testRow,0,3), k) == whoWin(testRow[11], testRow[12])) //note that now we assume knn distance takes three parameters, home, draw and away odds, so we slice that 3 parm out of the row, can change it 
            .size() //getting the length or the correct prediction
            .divide(testSetSize) //divdie corerct preditcion/testsetsize to find accarcy rate
            .value(); // finish chain 
        console.log("K level: "+ k+ " accuracy: " + acc)
    })
}



function knn(training, targetOdds, k) {
    return _.chain(training)
        .map(row => {                                           //note that now we assume our distance takes three parameters, home, draw and away odds
            return [                                            //return follow 2 things for our knn to work
                dis(_.slice(row,0,3), targetOdds), //get absolute distance for each row of the odds, edit the slice to include more parameters
                whoWin(row[11], row[12])]                      // get the training data result, who is winning
            })
        .sortBy(row => row[0])
        .slice(0, k)
        .countBy(row => row[1])
        .toPairs()
        .sortBy(row => row[1])
        .last()
        .first()
        //.parseInt()   //predict real score may need this
        .value()
}

function splitDataSet(data, testCount) {
    const shuffled = _.shuffle(data)
    const testSet = _.slice(shuffled, 0, testCount)
    const trainingSet = _.slice(shuffled, testCount)
    return [testSet, trainingSet]
}

runIt(odds)