import React, {Component} from 'react';
import Modal from 'react-modal';
import {MODELS_URL, TYPES_URL, VEHICLES_URL, VEHICLE_ID, VEHICLE_MODEL_ID, VEHICLE_TYPE_ID} from './constants'

class ModalWindow extends Component {
    constructor() {
        super();
        this.state = {isModalOpen: false};
    }

    componentDidMount() {
        fetch(TYPES_URL).then(response => response.json()).then(data => this.setState({types: data}));
        fetch(MODELS_URL).then(response => response.json()).then(data => this.setState({models: data}));
        fetch(VEHICLES_URL).then(response => response.json()).then(data => this.setState({vehicles: data}));
    }

    openModal = () => this.setState({isModalOpen: true});

    closeModal = () => this.setState({isModalOpen: false});

    renderTypesTree = () => {
        const {types, models} = this.state;
        if (types && models) {
            const {filter = []} = this.props;
            const typesArr = [];
            let isFiltered = false;
            filter.forEach(paramObj => {
                if (paramObj.hasOwnProperty(VEHICLE_TYPE_ID)) {
                    typesArr.push(this.getTypeTree(paramObj[VEHICLE_TYPE_ID]));
                    isFiltered = true;
                }
            });
            if (!isFiltered) {
                return this.getTypeTree()
            }
            return typesArr;
        }
    };

    renderModelsTree = () => {
        const {models} = this.state;
        if (models) {
            const {filter = []} = this.props;
            const modelsArr = [];
            let isFiltered = false;
            filter.forEach(paramObj => {
                if (paramObj.hasOwnProperty(VEHICLE_MODEL_ID)) {
                    modelsArr.push(this.getModelTree(paramObj[VEHICLE_MODEL_ID]));
                    isFiltered = true;
                }
            });
            if (!isFiltered) {
                return this.getModelTree()
            }
            return modelsArr;
        }
    };

    renderVehiclesTree = () => {
        const {vehicles} = this.state;
        if (vehicles) {
            const {filter = []} = this.props;
            const vehiclesArr = [];
            let isFiltered = false;
            filter.forEach(paramObj => {
                if (paramObj.hasOwnProperty(VEHICLE_ID)) {
                    vehiclesArr.push(this.getVehicleTree(paramObj[VEHICLE_ID]));
                    isFiltered = true;
                }
            });
            if (!isFiltered) {
                return this.getVehicleTree()
            }
            return vehiclesArr;
        }
    };

    getTypeTree = id => {
        const {types, models} = this.state;
        const typesForRendering = id ? types.filter(item => item.id === id) : types;
        const typesTree = typesForRendering.map(item => {
            const modelItems = [];
            models.forEach((model, index) => {
                const {vehicleType} = model;
                if (vehicleType && vehicleType.id === item.id) {
                    const vehicleItems = model.vehicles.map(vehicle => <li key={vehicle.id}>{vehicle.name}</li>);
                    const modelItemKey = item.id + model.id + model.name;
                    const modelItem = (
                        <ul key={modelItemKey}>
                            <li>Model: {model.name}</li>
                            <li>Vehicles:</li>
                            <ul>
                                {vehicleItems.length ? vehicleItems : 'NOT EXIST'}
                            </ul>
                        </ul>
                    );
                    const hr = <hr key={modelItemKey + index}/>;
                    modelItems.push(modelItem, hr);
                }
            });
            return (
                <ul key={item.id + item.name}>
                    <li>Type: {item.name}</li>
                    <li>Models</li>
                    {modelItems}
                </ul>);
        });
        return typesTree;

    };

    getModelTree = id => {
        const {models} = this.state;
        const modelsForRendering = id ? models.filter(item => item.id === id) : models;
        const modelsTree = modelsForRendering.map(model => {
            const vehicleItems = model.vehicles.map(vehicle => <li key={model.name + vehicle.name}>{vehicle.name}</li>);
            const {vehicleType} = model;

            return (
                <ul key={model.id + model.name}>
                    <li>Model: {model.name}</li>
                    <li>Type: {vehicleType.name}</li>
                    <li>Vehicles:</li>
                    <ul>{vehicleItems}</ul>
                </ul>);
        });
        return modelsTree;

    };

    getVehicleTree = id => {
        const {vehicles} = this.state;
        const vehiclesForRendering = id ? vehicles.filter(item => item.id === id) : vehicles;
        const vehiclesTree = vehiclesForRendering.map(vehicle => {
            const {vehicleModel} = vehicle;
            const {vehicleType} = vehicleModel;

            return (
                <ul key={vehicle.id + vehicle.name}>
                    <li>Vehicle name: {vehicle.name}</li>
                    <li>Type: {vehicleType.name}</li>
                    <li>Model: {vehicleModel.name}</li>
                </ul>);
        });

        return vehiclesTree;
    };


    render() {
        const {isModalOpen} = this.state;
        return (
            <div>
                <button onClick={this.openModal}>Open modal</button>
                <Modal
                    isOpen={isModalOpen}
                    contentLabel="Equipment"
                    onRequestClose={this.closeModal}
                >
                    <div className="row">
                        <div className="col">
                            <h3>Types</h3>
                            {this.renderTypesTree()}
                        </div>
                        <div className="col">
                            <h3>Models</h3>
                            {this.renderModelsTree()}
                        </div>
                        <div className="col">
                            <h3>Vehicles</h3>
                            {this.renderVehiclesTree()}
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default ModalWindow;
