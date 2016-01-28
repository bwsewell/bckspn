angular.module('bckspn', [])
.controller('BckspnCtrl', function($scope, $timeout, $http) {

  var row = {
    "player_1": "Brian",
    "player_2": "David",
    "player_1_hand": "right",
    "player_2_hand": "right",
    "server": "Brian",
    "game": 1,
    "player_1_score": 9,
    "player_2_score": 11,
    "player_1_score_diff": 0,
    "player_2_score_diff": 1,
    "lead": 2,
    "player_1_streak": 1,
    "player_2_streak": 0,
    "alt_pt_streak": 1,
    "player_1_long_streak": 1,
    "player_2_long_streak": 1,
    "player_1_largest_lead": 1,
    "player_2_largest_lead": 1,
    "tie": 1,
    "tie_count": 3,
    "player_1_serve_won": 2,
    "player_1_serve_lost": 2,
    "player_2_serve_won": 2,
    "player_2_serve_lost": 2,
    "player_1_win_prob": .5,
    "player_2_win_prob": .5,
    "player_1_games": 1,
    "player_2_games": 1
  };

  $scope.wordsmith = function() {
    $http.post('/ws', { data: row }).success(function(response) {
      $scope.response = response;

      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.voice = voices[10]; // Note: some voices don't support altering params
      msg.voiceURI = 'native';
      msg.volume = 1; // 0 to 1
      msg.rate = 10; // 0.1 to 10
      msg.pitch = 1; //0 to 2
      msg.text = response.content;
      msg.lang = 'en-GB';

      msg.onend = function(e) {
        console.log('Finished in ' + event.elapsedTime + ' seconds.');
      };

      speechSynthesis.speak(msg);
    }).error(function(response) {
      console.log(response);
    });
  };

});
