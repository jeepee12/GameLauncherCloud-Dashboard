import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase';

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


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      games: []
    };
    this.CalculateGameTime = this.CalculateGameTime.bind(this);
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
      this.setState({
        games: newState
      });
    });
  }

  CalculateGameTime(gametimes) {
    var totalMinutes = 0;
    for (let time in gametimes) {
      console.log(gametimes[time]);
      totalMinutes += gametimes[time].Value.NbMinutes;
    }

    return totalMinutes;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Tritor Gamelauncher Dashboard!</h1>
        </header>
        <p className="App-intro">
          These games are tracked:
        </p>
        <section className='display-game'>
          <div className="wrapper">
            <ul>
              {this.state.games.map((game) => {
                return (
                  <li key={game.id}>
                    <h3>Game:{game.name}</h3>
                    <p>Total time: {this.CalculateGameTime(game.gametimes)}</p>

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
