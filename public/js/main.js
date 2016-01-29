angular.module('bckspn', [])
.controller('BckspnCtrl', function($scope, $timeout, $http) {
  var msg = new SpeechSynthesisUtterance();
  var msg2 = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[10]; // Note: some voices don't support altering params
  msg.voiceURI = 'native';
  msg.volume = 1; // 0 to 1
  msg.rate = 1; // 0.1 to 10
  msg.pitch = 1; //0 to 2
  msg.lang = 'en-GB';

  $scope.rally = {
    "player_1": "",
    "player_2": "",
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
    "player_2_games": 0
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
    wordsmith();
  };

  $scope.score = function(player) {
    $scope.rally['player_' + player + '_score']++;
    updateStreaks(player);
    updateDiffs(player);
    $scope.rally.lead = Math.abs($scope.rally.player_1_score - $scope.rally.player_2_score);
    updateLeads();
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
      // speak($scope.pbp);
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
    msg.text = words;
    speechSynthesis.speak(msg);
  };

});
