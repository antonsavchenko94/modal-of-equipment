import React, {Component} from 'react';
import Modal from 'react-modal';
import 'whatwg-fetch'
import {MODELS_URL, TYPES_URL, VEHICLES_URL, VEHICLE_ID, VEHICLE_MODEL_ID, VEHICLE_TYPE_ID} from './constants'

class ModalWindow extends Component {
    constructor(props) {
        super();
        this.state = {isModalOpen: false, searchValue: '', filter: props.filter || []};
    }

    componentDidMount() {
        fetch(TYPES_URL).then(response => response.json()).then(data => this.setState({types: data}));
        fetch(MODELS_URL).then(response => response.json()).then(data => this.setState({models: data}));
        fetch(VEHICLES_URL).then(response => response.json()).then(data => this.setState({vehicles: data}));
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.state.filter) !== JSON.stringify(nextProps.filter)) {
            this.setState({filter: nextProps.filter || []});
        }
    }

    openModal = () => this.setState({isModalOpen: true});

    closeModal = () => this.setState({isModalOpen: false});

    onSearch = ({ currentTarget }) => {
        this.setState({ searchValue: currentTarget.value.trim(), filter: [] });
    }

    renderTypesTree = () => {
        const {types, models, filter} = this.state;
        if (types && models) {
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
        const {models, filter} = this.state;
        if (models) {
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
        const {vehicles, filter} = this.state;
        if (vehicles) {
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
        const {types, models, searchValue} = this.state;
        let typesForRendering = [];
        if(!searchValue) {
            typesForRendering = id ? types.filter(item => item.id === id) : types;
        }
        else {
            typesForRendering = types.filter(item => item.name.includes(searchValue));
        }

        const typesTree = typesForRendering.map(item => {
            const modelItems = [];
            models.forEach((model, index) => {
                const {vehicleType} = model;
                if (vehicleType && vehicleType.id === item.id && !searchValue) {
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
                <ul key={item.id + item.name} className="root-list">
                    <li>Type: {item.name}</li>
                    <li>Models</li>
                    {modelItems}
                </ul>);
        });
        return typesTree;

    };

    getModelTree = id => {
        const {models, searchValue} = this.state;
        let modelsForRendering = [];
        if(!searchValue) {
            modelsForRendering = id ? models.filter(item => item.id === id) : models;
        }
        else {
            modelsForRendering = models.filter(item => item.name.includes(searchValue));
        }
        const modelsTree = modelsForRendering.map(model => {
            const vehicleItems = model.vehicles.map(vehicle => <li key={model.name + vehicle.name}>{vehicle.name}</li>);
            const {vehicleType} = model;

            return (
                <ul key={model.id + model.name} className="root-list">
                    <li>Model: {model.name}</li>
                    <li>Type: {vehicleType.name}</li>
                    <li>Vehicles:</li>
                    <ul>{vehicleItems}</ul>
                    <hr/>
                </ul>);
        });
        return modelsTree;

    };

    getVehicleTree = id => {
        const {vehicles, searchValue} = this.state;
        let vehiclesForRendering = [];
        if(!searchValue) {
            vehiclesForRendering = id ? vehicles.filter(item => item.id === id) : vehicles;
        }
        else {
            vehiclesForRendering = vehicles.filter(item => item.name.includes(searchValue));
        }
        const vehiclesTree = vehiclesForRendering.map(vehicle => {
            const {vehicleModel} = vehicle;
            const {vehicleType} = vehicleModel;

            return (
                <ul key={vehicle.id + vehicle.name} className="root-list">
                    <li>Vehicle name: {vehicle.name}</li>
                    <li>Type: {vehicleType.name}</li>
                    <li>Model: {vehicleModel.name}</li>
                    <hr/>
                </ul>);
        });

        return vehiclesTree;
    };


    render() {
        const {isModalOpen, searchValue} = this.state;
        return (
            <div className="modal">
                <button onClick={this.openModal}>Open modal</button>
                <Modal
                    isOpen={isModalOpen}
                    contentLabel="Equipment"
                    onRequestClose={this.closeModal}
                >
                    <form>
                        <input className="search" type="search" value={searchValue} onChange={this.onSearch} placeholder="Search.." />
                    </form>
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
