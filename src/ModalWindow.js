import React, { Component } from 'react';
import Modal from 'react-modal';
import {MODELS_URL, TYPES_URL, VEHICLES_URL} from './requestUrls'

class ModalWindow extends Component {
    constructor() {
        super();
        this.state = { isModalOpen: false, types: [], models: [], vehicles: [] };
    }

    componentDidMount() {
        fetch(TYPES_URL).then(response => response.json()).then(data => this.setState({ types: data }));
        fetch(MODELS_URL).then(response => response.json()).then(data => this.setState({ models: data }));
        fetch(VEHICLES_URL).then(response => response.json()).then(data => this.setState({ vehicles: data }));
    }

    componentDidUpdate() {
        console.log('Updated !');
        console.log(this.state);
    }


    openModal = () => this.setState({ isModalOpen: true });

    closeModal = () => this.setState({ isModalOpen: false });


    render() {
        const { isModalOpen } = this.state;
        return (
            <div>
                <button onClick={this.openModal}>Open modal</button>
                <Modal
                    isOpen={isModalOpen}
                    contentLabel="Equipment"
                    onRequestClose={this.closeModal}
                >
                    'Some Text'
                </Modal>
            </div>
        );
    }
}

export default ModalWindow;
