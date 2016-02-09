angular.module('bckspn', [])
.controller('BckspnCtrl', function($scope, $timeout, $interval, $http) {
  var ref = new Firebase("https://bckspn.firebaseio.com/game");

  var msg = new SpeechSynthesisUtterance();
  var msg2 = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[10]; // Note: some voices don't support altering params
  msg.voiceURI = 'native';
  msg.volume = 1; // 0 to 1
  msg.rate = 1; // 0.1 to 10
  msg.pitch = 1; //0 to 2
  msg.lang = 'en-GB';

  ref.child('player_1').on('value', function (snapshot) {
    $scope.rally.player_1 = snapshot.val();
  });

  ref.child('player_2').on('value', function (snapshot) {
    $scope.rally.player_2 = snapshot.val();
  });

  ref.child('player_1_score').on('value', function (snapshot) {
    if ($scope.rally.player_1_score < snapshot.val()) {
      $scope.score(1);
    }
  });

  ref.child('player_2_score').on('value', function (snapshot) {
    if ($scope.rally.player_2_score < snapshot.val()) {
      $scope.score(2);
    }
  });

  $scope.rallies = [];

  $scope.rally = {
    "player_1": "Player 1",
    "player_2": "Player 2",
    "player_1_hand": "right",
    "player_2_hand": "right",
    "server": null,
    "game": 0,
    "player_1_score": 0,
    "player_2_score": 0,
    "player_1_score_diff": 0,
    "player_2_score_diff": 0,
    "lead": 0,
    "player_1_streak": 0,
    "player_2_streak": 0,
    "alt_pt_streak": 0,
    "player_1_long_streak": 0,
    "player_2_long_streak": 0,
    "player_1_largest_lead": 0,
    "player_2_largest_lead": 0,
    "tie": 0,
    "tie_count": 0,
    "player_1_serve_won": 0,
    "player_1_serve_lost": 0,
    "player_2_serve_won": 0,
    "player_2_serve_lost": 0,
    "player_1_win_prob": 0,
    "player_2_win_prob": 0,
    "player_1_games": 0,
    "player_2_games": 0,
    "winning_player": "",
    "losing_player": "",
    "serving_next": "",
    "served_last": "",
    "winning_score": 0,
    "losing_score": 0
  };

  $scope.test = function() {
    $scope.testing = true;
    $scope.newGame();
    var tester = $interval(function() {
      if ($scope.rally.server == null) {
        r = _.random(1,2);
        $scope.rally.server = $scope.rally["player_" + r];
      }
      r = _.random(1,2);
      $scope.score(r);
    }, 4000);
  };

  $scope.stop = function() {
    $scope.testing = false;
    $interval.cancel(tester);
  };

  $scope.newGame = function() {
    if ($scope.rally.player_1_score > $scope.rally.player_2_score) {
      $scope.rally.player_1_games++;
    } else if ($scope.rally.player_1_score < $scope.rally.player_2_score) {
      $scope.rally.player_2_games++;
    }
    $scope.rally.game++;
    $scope.rally.player_1_score = 0;
    $scope.rally.player_2_score = 0;
    $scope.rally.player_1_score_diff = 0;
    $scope.rally.player_2_score_diff = 0;
    $scope.rally.lead = 0;
    $scope.rally.server = null;
    $scope.rally.alt_pt_streak = 0;
    $scope.rally.player_1_long_streak = 0;
    $scope.rally.player_2_long_streak = 0;
    $scope.rally.player_1_largest_lead = 0;
    $scope.rally.player_2_largest_lead = 0;
    $scope.rally.tie = 0;
    $scope.rally.tie_count = 0;
    $scope.rally.player_1_serve_won = 0;
    $scope.rally.player_1_serve_lost = 0;
    $scope.rally.player_2_serve_won = 0;
    $scope.rally.player_2_serve_lost = 0;
    $scope.rally.player_1_win_prob = 0;
    $scope.rally.player_2_win_prob = 0;
    $scope.rally.winning_player = "";
    $scope.rally.losing_player = "";
    $scope.rally.serving_next = "";
    $scope.rally.served_last = "";
    $scope.rally.winning_score = 0;
    $scope.rally.losing_score = 0;

    ref.update({'player_1_score': 0, 'player_2_score': 0});

    addRally($scope.rally);
  };

  $scope.score = function(player) {
    $scope.rally['player_' + player + '_score']++;
    updateStreaks(player);
    updateDiffs(player);
    updateTies();
    updateServerStats();
    updateHelperCalcs();
    $scope.rally.lead = Math.abs($scope.rally.player_1_score - $scope.rally.player_2_score);
    updateLeads();
    addRally($scope.rally);
  };

  var updateHelperCalcs = function() {
    if ($scope.rally.player_1_score > $scope.rally.player_2_score) {
      $scope.rally.winning_score = $scope.rally.player_1_score;
      $scope.rally.losing_score = $scope.rally.player_2_score;
      $scope.rally.winning_player = $scope.rally.player_1;
      $scope.rally.losing_player = $scope.rally.player_2;
    } else if ($scope.rally.player_2_score > $scope.rally.player_1_score) {
      $scope.rally.winning_score = $scope.rally.player_2_score;
      $scope.rally.losing_score = $scope.rally.player_1_score;
      $scope.rally.winning_player = $scope.rally.player_2;
      $scope.rally.losing_player = $scope.rally.player_1;
    } else {
      $scope.rally.winning_score = $scope.rally.player_1_score;
      $scope.rally.losing_score = $scope.rally.player_1_score;
    }
    if (($scope.rally.player_1_score + $scope.rally.player_2_score) % 2 == 0) {
      if ($scope.rally.server == $scope.rally.player_1) {
        $scope.rally.serving_next = $scope.rally.player_2;
        $scope.rally.served_last = $scope.rally.player_1;
      } else if ($scope.rally.server == $scope.rally.player_2) {
        $scope.rally.serving_next = $scope.rally.player_1;
        $scope.rally.served_last = $scope.rally.player_2;
      }
    } else {
      $scope.rally.served_last = $scope.rally.serving_next;
    }
  };

  var addRally = function(rally) {
    var newRally = angular.copy(rally);
    $scope.rallies.push(newRally);
    wordsmith();
  };

  var updateDiffs = function(player) {
    if (player == 1) {
      $scope.rally.player_1_score_diff = 1;
      $scope.rally.player_2_score_diff = 0;
    } else if (player == 2) {
      $scope.rally.player_2_score_diff = 1;
      $scope.rally.player_1_score_diff = 0;
    }
  };

  var updateServerStats = function() {
    if ($scope.rally.server == $scope.rally.player_1) {
      if ($scope.rally.player_1_score_diff == 1) {
        $scope.rally.player_1_serve_won++;
      } else if ($scope.rally.player_2_score_diff == 1) {
        $scope.rally.player_1_serve_lost++;
      }
    } else if ($scope.rally.server == $scope.rally.player_2) {
      if ($scope.rally.player_2_score_diff == 1) {
        $scope.rally.player_2_serve_won++;
      } else if ($scope.rally.player_1_score_diff == 1) {
        $scope.rally.player_2_serve_lost++;
      }
    }
  };

  var updateServer = function() {
    var totalPoints = $scope.rally.player_1_score + $scope.rally.player_2_score;
    if (totalPoints % 2 == 0 && totalPoints != 0) {
      if ($scope.rally.server == $scope.rally.player_1) {
        $scope.rally.server = $scope.rally.player_2;
      } else if ($scope.rally.server == $scope.rally.player_2) {
        $scope.rally.server = $scope.rally.player_1;
      }
    }
  };

  var wordsmith = function() {
    $http.post('/ws', { data: $scope.rally }).success(function(response) {
      $scope.pbp = _.unescape(response.content).replace(/&#39;/g, '\'');
      speak($scope.pbp);
      $scope.rallies[$scope.rallies.length - 1].narrative = $scope.pbp;
      updateServer();
      if (isGameOver()) {
        $scope.newGame();
      }
    }).error(function(response) {
      console.log(response);
    });
  };

  var updateLeads = function() {
    if ($scope.rally.player_1_score > $scope.rally.player_2_score) {
      if ($scope.rally.lead > $scope.rally.player_1_largest_lead) {
        $scope.rally.player_1_largest_lead = $scope.rally.lead;
      }
    } else if ($scope.rally.player_1_score < $scope.rally.player_2_score) {
      if ($scope.rally.lead > $scope.rally.player_2_largest_lead) {
        $scope.rally.player_2_largest_lead = $scope.rally.lead;
      }
    }
  };

  var updateTies = function() {
    var totalPoints = $scope.rally.player_1_score + $scope.rally.player_2_score;
    if ($scope.rally.player_1_score == $scope.rally.player_2_score && totalPoints > 0) {
      $scope.rally.tie = 1;
      $scope.rally.tie_count++;
    } else {
      $scope.rally.tie = 0;
    }
  };

  var updateStreaks = function(player) {
    if (player == 1) {
      $scope.rally.player_1_streak++;
      $scope.rally.player_2_streak = 0;
      if ($scope.rally.player_1_streak > $scope.rally.player_1_long_streak) {
        $scope.rally.player_1_long_streak = $scope.rally.player_1_streak;
      }
    } else if (player == 2) {
      $scope.rally.player_2_streak++;
      $scope.rally.player_1_streak = 0;
      if ($scope.rally.player_2_streak > $scope.rally.player_2_long_streak) {
        $scope.rally.player_2_long_streak = $scope.rally.player_2_streak;
      }
    }
  };

  var isGameOver = function() {
    return (($scope.rally.player_1_score >= 11 || $scope.rally.player_2_score >= 11) && $scope.rally.lead >= 2) || ($scope.rally.lead == 7 && ($scope.rally.player_1_score == 0 || $scope.rally.player_2_score == 0));
  };

  var speak = function(words) {
    msg.text = words.replace(/lead/g, 'lede');
    speechSynthesis.speak(msg);
  };

  $scope.score_firebase = function(player) {
    ref.child('player_' + player + '_score').transaction(function(score) { return parseInt(score) + 1; });
  }

  $scope.speak = speak;

});
