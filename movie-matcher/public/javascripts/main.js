user = {};
onFbClicked = function() {
    FB.login(function (response) {
        if (response.authResponse) {
            $("#social-login").hide();
            $("#fb-loading").show();
            console.log('Welcome!  Fetching your information.... ', response);
            FB.api('/me?fields=name', function (response) {
                console.log("me ", response);
                user.name = response.name;
                user.id = response.id
                $("#fb-profile-pic").attr("src", "http://graph.facebook.com/" + user.id + "/picture?type=large");
//                        if (response.gender)user.gender = response.gender;
//                        if (response.birthday) {
//                            var b = response.birthday;
//                            b = b.substr(b.length - 4, 4);
//                            if (!isNaN(b)) {
//                                user.age = 2016-parseInt(b.substr(b.length - 4, 4));
//                                user.is_actual = true;
//                            }
//                        }
                FB.api('/me/picture?type=large', function (response) {
                    console.log("piclarge ", response);
                    user.profpic = response.data.url;
                    analyzeProfilePic(function (response) {
                        FB.api('/me/posts', function (response) {
                            console.log("posts ", response);
                            processFbPosts("", response, function (totalStr) {
                                user.posts = totalStr;
                                analyzePosts();
                            });
                        });
                    })
                });
            });
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, {scope: 'user_posts'});
};

function processFbPosts(curr, response, callback) {
    curr = response.data.reduce(function (a, b) {
        if (!b.message)return a;
        else return a + ". " + b.message;
    }, curr);
    if (curr.length < 6000 && response.paging.next && response.paging.next.length > 0) {
        $.get(response.paging.next, function (resp) {
            processFbPosts(curr, resp, callback);
        });
    }
    else callback(curr);
}

function updatePersonalityChart(key, pct, title) {
    pct = Math.round(pct);
    if (!title) title = key;
    user.psycho[key] = pct;
    $("#chart-" + key + "-title").html(title);
    $("#chart-" + key + "-pct").html(pct);
    $("#chart-" + key).data('easyPieChart').update(pct)
}
analyzeProfilePic = function(callback){
    $.get("/detect?url=graph.facebook.com/"+user.id+"/picture?type=large",
        function (response) {
            console.log("detect pic res ",response);
            if (response.images && response.images.length > 0 && response.images[0].faces.length > 0) {
                var face = response.images[0].faces[0];
                console.log("face ", face);
                if (!user.age && face.age) {
                    // var age;
                    // if (face.age.ageRange.indexOf("-") >= 0) {
                    //     var ageRange = face.age.ageRange.split("-");
                    //     age = (parseInt(ageRange[0]) + parseInt(ageRange[1])) / 2;
                    // }
                    // else if (face.age.ageRange.indexOf("<") >= 0) age = parseInt(face.age.ageRange.replace("<", ""));
                    // else if (face.age.ageRange.indexOf(">") >= 0) age = parseInt(face.age.ageRange.replace(">", ""));
                    user.age = face.age.min+"-"+face.age.max;
                }
                if (!user.gender && face.gender) {
                    user.gender = face.gender.gender.toLowerCase();
                }
                user.visual = face;

            }
            callback(response)
        }
    );
}
analyzePosts = function(){
    console.log("analyzing post user=", user);
    $.ajax
    ({
        type: "POST",
        url: '/analyze',
        dataType: 'json',
        async: false,
        //json object to sent to the authentication url
        data: {content: user.posts},
        success: function (response) {
            console.log("personality ", response);
            user.personality = response;
            user.psycho = {};
            $("#fb-loading").hide();
            setTimeout(function () {
                $("#fb-name").html(user.name);
                if (user.age) {
                    $("#fb-age").html("Age: " + user.age + (user.is_actual ? "" : " (Estimate)"));
                }
                else {
                    $("#fb-age").html("Age: N/A");
                }
                if (user.gender) {
                    $("#fb-gender").html("Gender: " + user.gender + (user.is_actual ? "" : " (Analyzed)"));
                }
                else {
                    $("#fb-gender").html("Gender: N/A");
                }
                $("#fb-result").fadeIn();
                setTimeout(function () {
                    updatePersonalityChart("Adventurousness", 100 * user.personality.tree.children[0].children[0].children[0].children[0].percentage);
                    updatePersonalityChart("Artistic", 100 * user.personality.tree.children[0].children[0].children[0].children[1].percentage);
                    updatePersonalityChart("Achievement", 100 * user.personality.tree.children[0].children[0].children[1].children[0].percentage, "Achievement-Striving");
                    updatePersonalityChart("Orderliness", 100 * user.personality.tree.children[0].children[0].children[1].children[3].percentage);
                    updatePersonalityChart("Neuroticism", 100 * user.personality.tree.children[0].children[0].children[4].percentage, "Emotional");
                    // updatePersonalityChart("Challenge", 100 * user.personality.tree.children[1].children[0].children[0].percentage, "Challenge-Seeking");
                    // analyzePsycho();
                    setTimeout(function () {
                        const winner = user.personality.winner;
                        console.log("winner is ", winner);
                        $("#fb-model").attr('href', winner.data.link);
                        $("#fb-model").html("" + winner.data.name);
                        // $("#fb-content").css('background-image', 'url(/images/posters/' + winner.id + '.jpg)');
                        $("#movie-poster").attr('src', '/images/posters/' + winner.id + '.jpg');
                        $("#movie-btn").attr('href', winner.data.link);
                        $("#movie-btn").text(winner.data.name);
                        $("#movie-container").fadeIn();
                        // $("#fb-recommend").fadeIn();

                    }, 1000);
                }, 1000);
            }, 500);
        }
    });
}
//
// var models = {
//     "secret_life_of_pet": {
//         name: "The Secret Life of Pets",
//         link: "http://www.imdb.com/title/tt2709768/"
//     },
//     "cloverfield_lane": {
//         name: "10 Cloverfield Lane",
//         link: "http://www.imdb.com/title/tt1179933/"
//     },
//     "vvintch": {
//         name: "The VVitch",
//         link: "http://www.imdb.com/title/tt4263482/"
//     },
//     "keanu": {
//         name: "Keanu",
//         link: "http://www.imdb.com/title/tt4139124/"
//     },
//     "huntsman": {
//         name: "The Huntsman: Winter's War",
//         link: "http://www.imdb.com/title/tt2381991/"
//     },
//     "anomalisa": {
//         name: "Anomalisa",
//         link: "http://www.imdb.com/title/tt2401878/"
//     },
//     "against_the_ropes": {
//         name: "Against the Ropes",
//         link: "http://www.imdb.com/title/tt0312329/"
//     },
//     "mighty_heart": {
//         name: "A Mighty Heart",
//         link: "http://www.imdb.com/title/tt0829459/"
//     },
//     "american_splendor": {
//         name: "American Splendor",
//         link: "http://www.imdb.com/title/tt0305206/"
//     }
// };
// function randomBackground() {
//     var arr = Object.keys(models);
//     var i = Math.floor(Math.random() * arr.length);
//     // console.log(models[arr[i]].pic);
//     $("#fb-content").css('background-image', 'url(/images/posters/' + arr[i] + '.jpg)');
// }