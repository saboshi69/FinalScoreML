# FinalScoreML v1.00
Predict Home win / Draw / Away Win using KNN-model on Javascript



### WARNING: Please DONT USE IT ON BETTING, IT COULD TAKE ALL YOUR MONEY ###


This model could predict which team is going to win, base on odds (Win rate: 60% ~ 65%).
The application supports three services:

1. Knn model testing
2. Forward testing
3. Auto Online Bet Placing 


### How to use  ###

1. Path to the directory
2. In your terminal, input `node run`
3. Pick an action
4. Enjoy!

### Set up Online Auto Bet Placing  on Jockey Club

Please create a .env file on the main directory to save your setting.
You can visit the link below if you don't get it.
https://www.npmjs.com/package/dotenv

Here's the file format: <br><br>
DB_USER=*yourUserName* <br>
DB_PASS=*yourUserPassword* <br>
DB_A1=*yourFirstSecurityAnswer* <br>
DB_A2=*yourSecondSecurityAnswer* <br>
DB_A3=*yourThirdSecurityAnswer* <br>
DB_Q1=*yourFirstSecurityQuestion* <br>
DB_Q2=*yourSecondSecurityQuestion* <br>

*reminder:* The security questions need to include "?"

### Source of data

All testing data is collected from The Hong Kong Jockey Club.
For more information, please visit:
https://www.hkjc.com/home/chinese/index.aspx
