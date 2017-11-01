import React, {Component} from 'react';

import logo from './logo.svg';
import './App.css';
import ModalWindow from './ModalWindow';

class App extends Component {
    render() {
        const filter = [
            { vehicleTypeId: 1 },
            { vehicleModelId: 1 },
            { vehicleId: 1 }
        ]

        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <ModalWindow filter={filter}/>
            </div>
        );
    }
}

export default App;
