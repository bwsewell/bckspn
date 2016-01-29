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
    $scope.rally.game++;
    wordsmith();
  };

  $scope.score = function(player) {
    $scope.rally['player_' + player + '_score']++;
    updateDiffs(player);
    $scope.rally.lead = Math.abs($scope.rally.player_1_score - $scope.rally.player_2_score);
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
      speak($scope.pbp);
      updateServer();
    }).error(function(response) {
      console.log(response);
    });
  };

  var speak = function(words) {
    msg.text = words;
    speechSynthesis.speak(msg);
  };

});
