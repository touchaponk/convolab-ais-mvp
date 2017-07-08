var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var Twitter = require('twitter');
var config = require("./config.json");
const request = require("request");
var googTranslateKey = config.keys.google_translate;
var googleTranslate = require('google-translate')(googTranslateKey);

var debug = require('debug')('movie-matcher:server');
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);


var personality_insights = watson.personality_insights({
    username: config.keys.personality_insights.username,
    password: config.keys.personality_insights.password,
    version: 'v2'
});
app.get("/detect", function(req, res){
    const url = "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/detect_faces?" +
        "api_key="+config.keys.visual_recognition+"&version=2016-05-20&url="+req.query.url;
    request.get({url:url, json:true}, function(err, resp, json){
        res.json(json);
    });
});
app.post("/analyze", function(req, res){
    //debug("body ", req.body);
    var ctext = req.body.content;
    googleTranslate.translate(ctext, "en", function (err, translation) {
        if (err || (translation.translatedText === null || translation.translatedText === undefined )) {
            debug("error while translating " + ctext + " err: ", err, " res:", translation);
        }
        else {
            var cnt = translation.translatedText;
            var count = cnt.split(" ").length;
            var pointer = 0;
            var dummies = ("We can infer personality characteristics with reasonable accuracy, but the real question is how they impact real world behavior. Over the last few years, we have conducted a set of studies to identify the extent to which such personality characteristics can predict people’s behavior and preferences. We found that people with high openness and low emotional range (neuroticism) scores were likely to respond favorably to opportunities such as clicking on an advertisement or following an account. To demonstrate this, we found that targeting the top 10 percent of such users resulted in increases in click rate from 6.8 percent to 11.3 percent, and in follow rate from 4.7 percent to 8.8 percent. "+
            "Multiple recent studies show similar results for characteristics computed from social media data. One recent study with retail store data found that people with high orderliness, self-discipline, and cautiousness scores, but low immoderation scores, were 40 percent more likely to respond to coupons than the random population. A second study found that people with specific Values had  specific reading interests. For example, people with a higher self-transcendence (motivation to help others) value demonstrated an interest in reading articles about the environment, and people with a higher self-enhancement (concerned with their  own success) value showed an interest in reading articles about work. A third study of more than 600 Twitter users found that a person’s personality characteristics can predict his or her brand preference with 65 percent accuracy. "+
            "When inferring information from text, a key question is how much text is required in order to make reliable inferences about personality characteristics. We have done experiments to understand how word quantity affects our assesments, and have found that our service requires at least 3500 words written by an individual to produce a personality portrait with meaningful results. If you submit fewer than 2000 words, the service reports a warning but still processes the input.  If you provide fewer than 100 words, the service reports an error and does not analyze the input text. In addition, the input text must contain at least 70 words that match words found in the standard Linguistic Inquiry and Word Count (LIWC) psycholinguistic dictionary. The requirement of a minimum of 70 matching words from this dictionary was verified through a series of experiments that were done with the corpus used by the service.")
                .split(" ");
            var mock = ["Well, thank you very much, Jim, for this opportunity. I want to thank Governor Romney and the University of Denver for your hospitality.There are a lot of points I want to make tonight, but the most important one is that 20 years ago I became the luckiest man on Earth because Michelle Obama agreed to marry me. And so I just want to wish, Sweetie, you happy anniversary and let you know that a year from now we will not be celebrating it in front of 40 million people. You know, four years ago we went through the worst financial crisis since the Great Depression. Millions of jobs were lost, the auto industry was on the brink of collapse. The financial system had frozen up.And because of the resilience and the determination of the American people, we've begun to fight our way back. Over the last 30 months, we've seen 5 million jobs in the private sector created. The auto industry has come roaring back. And housing has begun to rise. But we all know that we've still got a lot of work to do. And so the question here tonight is not where we've been, but where we're going. Governor Romney has a perspective that says if we cut taxes, skewed towards the wealthy, and roll back regulations, that we'll be better off. I've got a different view.",
                "For more than twenty years past I have been paying special attention to the question of Health. While in England, I had to make my own arrangements for food and drink, and I can say, therefore, that my experience is quite reliable. I have arrived at certain definite conclusions from that experience, and I now set them down for the benefit of my readers. As the familiar saying goes, ‘Prevention is better than cure.’ It is far easier and safer to prevent illness by the observance of the laws of health than to set about curing the illness which has been brought on by our own ignorance and carelessness. Hence it is the duty of all thoughtful men to understand aright the laws of health, and the object of the following pages is to give an account of these laws. We shall also consider the best methods of cure for some of the most common diseases. As Milton says, the mind can make a hell of heaven or a heaven of hell. So heaven is not somewhere above the clouds, and hell somewhere [Pg 2] underneath the earth! We have this same idea expressed in the Sanskrit saying, Mana êva Manushayanâm Kâranam Bandha Mokshayoh—man’s captivity or freedom is dependant on the state of his mind. From this it follows that whether a man is healthy or unhealthy depends on himself. Illness is the result not only of our actions but also of our thoughts. As has been said by a famous doctor, more people die for fear of diseases like small-pox, cholera and plague than out of those diseases themselves. Ignorance is one of the root-causes of disease. Very often we get bewildered at the most ordinary diseases out of sheer ignorance, and in our anxiety to get better, we simply make matters worse. Our ignorance of the most elementary laws of health leads us to adopt wrong remedies or drives us into the hands of the veriest quacks. How strange (and yet how true) it is that we know much less about things near at hand than things at a distance. We know hardly anything of our own village, but we can give by rote the names of the rivers and mountains of England! We take so much trouble to learn the names of the stars in the sky, while we hardly think it worth while to know the things that are in our own homes! We never care a jot for the splendid pageantry of Nature before our very eyes, while we are so anxious to witness the [Pg 3] puerile mummeries of the theatre! And in the same way, we are not ashamed to be ignorant of the structure of our body, of the way in which the bones and muscles, grow, how the blood circulates and is rendered impure, how we are affected by evil thoughts and passions, how our mind travels over illimitable spaces and times while the body is at rest, and so on. There is nothing so closely connected with us as our body, but there is also nothing perhaps of which our ignorance is so profound, or our indifference so complete.",
                ,"Recently the local IBM Thailand team has arranged a festive singing contest where they would arrange 3 rounds of contests amongst candidates to seek for the best singer in IBM Thailand. Whilst the first 2 contests were arranged and judged by a committee, the team wanted a public voting system for the final round, which will be on IBM Xmas celebration event. Rush Timeline & Rapid Development With only 5 days until the event, I felt like this could be perfect for proving one of the very core value of Bluemix - to rapidly build and deploy scalable application - so I went to the team and offered them to build the voting system within 3 days - leaving 1 day for testing. I proposed 3 types of systems - Web-based, SMS-based or call-based voting system. The team eventually ends up with call-based voting system due to the 3 main advantages Voter doesn't need any internet access There's no cost incurred to the voter Ensure 1 vote per 1 person without requiring additional mechanism How the System Works The system would run on Java service on IBM Bluemix and interacts with Twilio service (also available on Bluemix) to make the actual phone call. The call-based voting system works on 3 simple steps: The staff initiate the voting process on the list of voters The system make a call to the voters, asking them to press the candidate number they like to vote for. The system telly the result and display it back to the staff in real-time"
            ];
            debug(dummies.length);
            while(count < 350 && pointer < dummies.length){
                cnt += dummies[pointer++]+" ";
            }
            debug("text ", cnt);
            personality_insights.profile({
                    text: cnt,
                    language: 'en' },
                function (err, response, body) {
                    debug(err, response);
                    if (err){
                        debug('errors:', err);
                        var cnt = mock[Math.floor(Math.random()*3)];
                        personality_insights.profile({
                                text: cnt,
                                language: 'en' },
                            function (err, response, body) {
                                debug(err, response);
                                if (err) {
                                    debug('error2:', err);
                                }
                                else{
                                    response.winner = getWinner(response);
                                    debug("resp2: ", response);
                                    res.status(200);
                                    res.json(response);
                                }
                            });
                    }
                    else {
                        response.winner = getWinner(response);
                        debug("resp ", response);
                        res.status(200);
                        res.json(response);
                    }
                });
        }
    });
});
function getWinner(response){
    const inputPersonality = getPersonalityObject(response);
    const totalLost = {};
    let minLost = 10000, minLostMovie;
    for(let i in moviesData){
        const movie = moviesData[i];
        totalLost[i] = 0;
        for(let j in inputPersonality){
            totalLost[i] += Math.abs(inputPersonality[j] - movie[j]);
        }
        debug("total lost for ",i," is ",totalLost[i]);
        if(minLost > totalLost[i]){
            minLost = totalLost[i];
            minLostMovie = i;
        }
    }
    return {
        id:minLostMovie,
        data: config.movies[minLostMovie]
    };
}
function getPersonalityObject(response){
    const pobj = {};
    pobj["Adventurousness"] = 100 * response.tree.children[0].children[0].children[0].children[0].percentage;
    pobj["Artistic"] = 100 * response.tree.children[0].children[0].children[0].children[1].percentage;
    pobj["Achievement"] = 100 * response.tree.children[0].children[0].children[1].children[0].percentage;
    pobj["Orderliness"] = 100 * response.tree.children[0].children[0].children[1].children[3].percentage;
    pobj["Neuroticism"] = 100 * response.tree.children[0].children[0].children[4].percentage;
    pobj["Challenge"] = 100 * response.tree.children[1].children[0].children[0].percentage;
    return pobj;
}
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

debug("Analyzing movie data");
const moviesData = {};
for(let i in config.movies){
    personality_insights.profile({
            text: config.movies[i].content,
            language: 'en' },
        function (err, response, body) {
            debug(err, response);
            if (err) {
                debug('error2:', err);
            }
            if(response){
                moviesData[i] = getPersonalityObject(response);
            }
        });
}

module.exports = app;
