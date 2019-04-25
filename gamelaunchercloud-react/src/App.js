import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase';
import DatePicker from 'react-date-picker';

// Based on : https://firebase.google.com/docs/database/web/start?authuser=0
// Set the configuration for your app
var config = {
  apiKey: process.env.REACT_APP_GOOGLE_FIREBASE_API_KEY,
  authDomain: "tritor-game-launcher.firebaseapp.com",
  databaseURL: "https://tritor-game-launcher.firebaseio.com/",
  storageBucket: "tritor-game-launcher.appspot.com"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();
// 1 day in milliseconds
const ONE_DAY = 1000 * 60 * 60 * 24


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dateStart: new Date(),
      dateEnd: new Date(),
      allTimeGameTime: 0,
      rangeGameTime: 0,
      games: []
    };
    this.CalculateAllTimeTime = this.CalculateAllTimeTime.bind(this);
    this.CalculateRangeTime = this.CalculateRangeTime.bind(this);
    this.CalculateAllTimeGameTime = this.CalculateAllTimeGameTime.bind(this);
    this.CalculateRangeGameTime = this.CalculateRangeGameTime.bind(this);
    this.CalculateRangeNumberOfGames = this.CalculateRangeNumberOfGames.bind(this);

    this.GetNumberOfDays = this.GetNumberOfDays.bind(this);
    this.GetNumberOfDaysInRange = this.GetNumberOfDaysInRange.bind(this);
    this.GetNumberOfDaysAllTime = this.GetNumberOfDaysAllTime.bind(this);
    this.MinutesToExpandTimeText = this.MinutesToExpandTimeText.bind(this);
    this.SortGamesByTime = this.SortGamesByTime.bind(this);
    this.TransformTwoDigits = this.TransformTwoDigits.bind(this);
  }

  componentDidMount() {
    const gamesRef = database.ref('Games');
    gamesRef.on('value', (snapshot) => {
      let games = snapshot.val();
      let newState = [];
      for (let game in games) {
        newState.push({
          id: game,
          name: games[game].Name,
          url: games[game].Url,
          gametimes: games[game].Gametimes
        });
      }
      this.SortGamesByTime(newState)
      this.setState({
        games: newState
      });
    });
  }

  CalculateAllTimeGameTime(gametimes) {
    var totalMinutes = 0;
    for (let time in gametimes) {
      //console.log(gametimes[time]);
      totalMinutes += gametimes[time].Value.NbMinutes;
    }
    return totalMinutes;
  }

  CalculateRangeGameTime(gametimes) {
    var totalMinutes = 0;
    for (let time in gametimes) {
      var date = new Date(gametimes[time].Key);
      if (date >= this.state.dateStart && date <= this.state.dateEnd) {
        totalMinutes += gametimes[time].Value.NbMinutes;
      }
    }
    return totalMinutes;
  }

  CalculateAllTimeTime() {
    var totalMinutes = 0;
    for (let gameIndex in this.state.games) {
      var game = this.state.games[gameIndex];
      for (let timeIndex in game.gametimes) {
        var time = game.gametimes[timeIndex];
        totalMinutes += time.Value.NbMinutes;
      }
    }
    return totalMinutes;
  }

  CalculateRangeTime() {
    var totalMinutes = 0;
    for (let gameIndex in this.state.games) {
      var game = this.state.games[gameIndex];
      for (let timeIndex in game.gametimes) {
        var time = game.gametimes[timeIndex];
        var date = new Date(time.Key);
        if (date >= this.state.dateStart && date <= this.state.dateEnd) {
          totalMinutes += time.Value.NbMinutes;
        }
      }
    }
    return totalMinutes;
  }

  CalculateRangeNumberOfGames() {
    var numberOfGame = 0;
    for (let gameIndex in this.state.games) {
      var game = this.state.games[gameIndex];
      for (let timeIndex in game.gametimes) {
        var time = game.gametimes[timeIndex];
        var date = new Date(time.Key);
        if (date >= this.state.dateStart && date <= this.state.dateEnd) {
          numberOfGame += 1;
          break;
        }
      }
    }
    return numberOfGame;
  }

  GetNumberOfDays(datestart, dateend) {
    return Math.floor((dateend.getTime() - datestart.getTime()) / ONE_DAY);
  }

  GetNumberOfDaysInRange() {
    return this.GetNumberOfDays(this.state.dateStart, this.state.dateEnd);
  }

  GetNumberOfDaysAllTime() {
    return this.GetNumberOfDays(new Date(2013, 6, 10), new Date());
  }

  MinutesToExpandTimeText(NbMinutes) {
    return NbMinutes + "Minutes. " + this.TransformTwoDigits(NbMinutes / 60)
      + "Hours. " + this.TransformTwoDigits(NbMinutes / 60 / 24) + "Days.";
  }

  SortGamesByTime(games) {
    games.sort((game1, game2) => {
      var game1RangeTime = this.CalculateRangeGameTime(game1.gametimes);
      var game2RangeTime = this.CalculateRangeGameTime(game2.gametimes);
      // With want to sort from the highest to the lowest, so game2 - game1
      if (game1RangeTime !== 0 || game2RangeTime !== 0) {
        // console.log("Range")
        return game2RangeTime - game1RangeTime;
      }
      else {
        var game1AllTime = this.CalculateAllTimeGameTime(game1.gametimes);
        var game2AllTime = this.CalculateAllTimeGameTime(game2.gametimes);
        // console.log("alltime")
        return game2AllTime - game1AllTime;
      }
    })
    return games;
  }

  TransformTwoDigits(number) {
    return parseFloat(Math.round(number * 100) / 100).toFixed(2);
  }

  dateStartOnChange = dateStart => {
    this.setState({ dateStart })
    return dateStart;
  }
  dateEndOnChange = dateEnd => {
    this.setState({ dateEnd })
    return dateEnd;
  }

  render() {
    var sortedGames = this.SortGamesByTime(this.state.games);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Tritor Gamelauncher Dashboard!</h1>
        </header>

        <section className='totalGameTime'>
          <div>
            Range starts at:&nbsp;
            <DatePicker
              onChange={this.dateStartOnChange}
              value={this.state.dateStart}
            />
            &nbsp;
            Range ends at:&nbsp;
            <DatePicker
              onChange={this.dateEndOnChange}
              value={this.state.dateEnd}
            />
            <br />
            Number of days in the range:{this.GetNumberOfDaysInRange()}
          </div>
          <div>
            Range total game time: {this.CalculateRangeTime()} minutes,&nbsp;
            {this.TransformTwoDigits(this.CalculateRangeTime() / 60.0)} hours,&nbsp;
            {this.TransformTwoDigits(this.CalculateRangeTime() / 60.0 / 24.0)} days.&nbsp;
            {this.TransformTwoDigits(this.CalculateRangeTime() / 60.0 / this.GetNumberOfDaysInRange())} hours / day.&nbsp;
            Time is split between {this.CalculateRangeNumberOfGames()} game(s).
            <br />
            All time game time (June 10, 2013): {this.CalculateAllTimeTime()} minutes,&nbsp;
            {this.TransformTwoDigits(this.CalculateAllTimeTime() / 60.0)} hours,&nbsp;
            {this.TransformTwoDigits(this.CalculateAllTimeTime() / 60.0 / 24.0)} days.&nbsp;
            {this.TransformTwoDigits(this.CalculateAllTimeTime() / 60.0 / this.GetNumberOfDaysAllTime())} hours / day
            <br />
            Time is split between {sortedGames.length} games.
          </div>
        </section>

        <p className="App-intro">
          These games are tracked:
        </p>
        <section className='display-game'>
          <div className="wrapper">
            <ul>
              {sortedGames.map((game) => {
                return (
                  <li key={game.id}>
                    <h3>{game.name}</h3>
                    <p>Range total time: {this.MinutesToExpandTimeText(this.CalculateRangeGameTime(game.gametimes))}</p>
                    <p>All time total time: {this.MinutesToExpandTimeText(this.CalculateAllTimeGameTime(game.gametimes))}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
