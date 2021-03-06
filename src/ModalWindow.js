import React, {Component} from 'react';
import Modal from 'react-modal';
import 'whatwg-fetch'
import {MODELS_URL, TYPES_URL, VEHICLES_URL, FILTER_PARAMS_NAMES} from './constants'

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

    getUniqueDOM = (arr) => {
        return arr.reduce((unique, o) => {
            if(!unique.find(obj => obj.key === o.key)) {
                unique.push(o);
            }
            return unique;
        },[]);
    }

    testString = (string) => {
        let {searchValue} = this.state;
        searchValue = searchValue.replace(/ +/g, ' ').toLowerCase();
        const text = string.replace(/\s+/g, ' ').toLowerCase();
        return !!~text.indexOf(searchValue);
    }

    onSearch = ({ currentTarget }) => {
        this.setState({ searchValue: currentTarget.value, filter: [] });
    }

    renderTypesTree = () => {
        const {types, models, vehicles,  filter, searchValue} = this.state;
        if(types && models && vehicles) {
            if (filter.length) {
                const DOMArray = [];
                filter.forEach(paramObj => {
                    const dom = this.getSubTree(paramObj);
                    if (dom) DOMArray.push(dom);
                });
                return this.getUniqueDOM(DOMArray);
            }
            else if(!filter.length && !searchValue) {
                return this.getAllTree();
            } else if(searchValue) {
                return this.getSubTree();
            }
        }
    };

    getSubTree = (param = {})=> {
        const paramKey = Object.keys(param).length ? Object.keys(param)[0] : null;
        const paramValue = Object.values(param).length ? Object.values(param)[0] : null;
        const {types, models, vehicles, searchValue} = this.state;
        let resultArray = [];
        let modelsTree = [];
        /* eslint-disable */
        switch(true) {
            case paramKey === FILTER_PARAMS_NAMES.typeId || !!searchValue:
                const singleType = types.find(type => type.id === paramValue || (searchValue && this.testString(type.name)));
                if (singleType) {
                    const modelsOfType = models.filter(model => model.vehicleType && model.vehicleType.id === singleType.id);
                    modelsTree = this.getModelTree(modelsOfType);
                    if (!searchValue) return this.getTTree(singleType, modelsTree);
                    else {
                        resultArray.push(this.getTTree(singleType, modelsTree));
                    }
                }
            case paramKey === FILTER_PARAMS_NAMES.modelId:
                const singleModel = models.filter(model => model.id === paramValue || (searchValue && this.testString(model.name)));
                if (singleModel.length) {
                    const typeOfModel = singleModel[0].vehicleType;
                    modelsTree = this.getModelTree(singleModel);
                    if (!searchValue) return this.getTTree(typeOfModel, modelsTree);
                    else resultArray.push(this.getTTree(typeOfModel, modelsTree));
                }
            case paramKey === FILTER_PARAMS_NAMES.vehicleId:
                const singleVehicle = vehicles.filter(vehicle => vehicle.id === paramValue || (searchValue && this.testString(vehicle.name)));
                if (singleVehicle.length) {
                    const {vehicleModel} = singleVehicle[0];
                    const {vehicleType} = vehicleModel;
                    vehicleModel.vehicles = singleVehicle;
                    console.log('singleVehicle = ', singleVehicle);
                    modelsTree = this.getModelTree([vehicleModel]);
                    if (!searchValue) return this.getTTree(vehicleType, modelsTree);
                    else resultArray.push(this.getTTree(vehicleType, modelsTree));
                }
            default:
                return this.getUniqueDOM(resultArray);
        }
        /* eslint-disable */
    };

    getTTree = (type, modelsTree) => {
        return (
            <ul key={type.id + type.name} className="root-list">
                <li>Type: {type.name}</li>
                <li>Models:</li>
                {modelsTree}
            </ul>);
    };

    getModelTree = models => {
        return models.map(model => {
            const {vehicles} = model;
            const vehiclesItem = this.getVehiclesTree(vehicles);
            return (
                <ul key={model.id + model.name}>
                    <li>Model - {model.name}</li>
                    <li>Vehicles: {vehiclesItem.length ? '' : 'Not found'}</li>
                    <ul>{vehiclesItem}</ul>
                </ul>
            );
        })

    };

    getVehiclesTree = vehicles => {
        return vehicles.map(vehicle => {
            return (<li key={vehicle.name + vehicle.id}>{vehicle.name}</li>);
        });
    };

    getAllTree = ()=> {
        const {types, models} = this.state;
        return types.map(typeItem => {
            const modelItems = [];
            models.forEach((model, index) => {
                if(model.vehicleType && model.vehicleType.id === typeItem.id){
                    const vehicleItems = model.vehicles.map(vehicle => <li key={vehicle.id}>{vehicle.name}</li>);
                    const modelItemKey = typeItem.id + model.id + model.name;
                    const modelItem = (
                        <ul key={modelItemKey}>
                            <li>Model: {model.name}</li>
                            <li>Vehicles:</li>
                            <ul>
                                {vehicleItems.length ? vehicleItems : <li>NOT EXIST</li>}
                            </ul>
                        </ul>
                    );
                    const hr = <hr key={modelItemKey + index}/>;
                    modelItems.push(modelItem, hr);
                }
            });
            return (
                <ul key={typeItem.id + typeItem.name} className="root-list">
                    <li>Type: {typeItem.name}</li>
                    <li>Models</li>
                    {modelItems}
                </ul>);
        });

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
                    style={{content: {left: '25%', width: '50%'}}}
                >
                    <form>
                        <input className="search" type="search" value={searchValue} onChange={this.onSearch} placeholder="Search.." />
                    </form>
                    <h3>Types</h3>
                    {this.renderTypesTree()}
                </Modal>
            </div>
        );
    }
}

export default ModalWindow;
