import React, {Component} from 'react';
import Designer from "../src/Designer";
import Fab from "@material-ui/core/Fab";
import {AddBox, AddCircle, ChangeHistory, Dehaze, Delete, Edit, Save, Visibility} from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";

const layersList = [
    {name: "layer 1", checked: true, id: '0', strokeColor: '#9B9B9B', fillColor: '#50E3C2', fillOpacity: 1},
    {name: "layer 2", checked: true, id: '1', strokeColor: '#F5A623', fillColor: '#4A90E2', fillOpacity: 1},
    {name: "layer 3", checked: true, id: '2', strokeColor: '#F8E71C', fillColor: '#9013FE', fillOpacity: 1},
    {name: "layer 4", checked: true, id: '3', strokeColor: '#8B572A', fillColor: '#BD10E0', fillOpacity: 1},

];

const layersListInit = [];

const viewSettings = {
    iconObjectList: <Tooltip title={'Object List'} placement="right"><Fab size={"small"}><Dehaze/></Fab></Tooltip>,
    iconViewMode: <Tooltip title={'Go to View Mode (R)'} placement="right">
        <Fab size={"small"}><Visibility/></Fab></Tooltip>,
    iconEditMode: <Tooltip title={'Go to Edit Mode (E)'} placement="right"><Fab size={"small"}><Edit/></Fab></Tooltip>,
    iconCircle: <Tooltip title={'Create Circle'} placement="right"><Fab size={"small"}><AddCircle/></Fab></Tooltip>,
    iconRectangle: <Tooltip title={'Create Rectangle'} placement="right"><Fab size={"small"}><AddBox/></Fab></Tooltip>,
    iconPolyObject: <Tooltip title={'Create Polygon'} placement="right">
        <Fab size={"small"}><ChangeHistory/></Fab></Tooltip>,
    iconDelete: <Fab size={"small"}> <Delete/></Fab>,
    iconSave: <Tooltip title={'Save'} placement="right"><Fab size={"small"}><Save/></Fab></Tooltip>,
};


export default class App extends Component {
    image = "https://cdn.simplecast.com/images/e0053e/e0053e88-d023-45b0-8634-ed2557f511e0/0f188086-239b-47ff-8094-00d1f611043f/3000x3000/1549944562-artwork.jpg?aid=rss_feed";
    state = {
        objects: [],
        access: true,
        layersList: layersListInit,
        openSnackBar: false,
        snackBarMessage: ""
    };

    componentDidMount() {
        let self = this;
        setTimeout(() => self.setState({layersList: layersList}), 1000);
    }
    handleUpdate(objects) {
        console.log("handleUpdate", objects);
        this.setState({objects});
    }
    objectClickHandler(object) {
        this.setState({openSnackBar: true, snackBarMessage: "You clicked on" + object.uuid,})
        alert("You clicked on object " + object.uuid)
    }
    creationFormHandler = (index, objects) => {
        objects[index].sst = prompt("insert the layer", this.getTitle(objects[index]));
    };
    getTitle(object) {
        return object.sst ? object.sst : "name not specified"
    }
    getLayer = (object) => {
        return object.sst
    };
    changeAccess = () => {
        this.setState({access: !this.state.access})
    };
    saveColors = (arr) => {
        console.log('arr', arr);
    };
    handleCloseSnackBar = () => {
        this.setState({openSnackBar: false})
    };

    render() {
        return (<div>
                <Snackbar
                    autoHideDuration={6000}
                    open={this.state.openSnackBar}
                    onClose={this.handleCloseSnackBar}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    // TransitionComponent={transition}
                    message={this.state.snackBarMessage}
                />
                <div style={{
                    margin: 4,
                    color: 'white',
                    width: 'auto',
                    background: '#1976d2',
                    boxShadow: '0 0 5px 0 gray',
                    borderRadius: 4
                }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 11fr 6fr'}}>
                        <div style={{width: 'auto', margin: '5px 15px', display: 'flex', alignItems: 'center'}}>
                            <div>tools</div>
                            <div style={{margin: '0 0 0 10px', width: '190px',}}>
                                <Button variant="contained" onClick={this.changeAccess} style={{
                                    fontSize: 10,
                                    height: 15,
                                    lineHeight: 'inherit',
                                    padding: '2px 5px',
                                    display: "flex"
                                }}>
                                    {this.state.access &&
                                    <div> edit access <span style={{color: '#1976d2'}}>enabled </span></div>}
                                    {!this.state.access &&
                                    <div> edit access<span style={{color: '#1976d2'}}> disabled </span></div>}
                                </Button>
                            </div>
                        </div>
                        <div style={{margin: '5px', justifyContent: 'center', display: 'flex'}}>designer</div>
                        <div style={{margin: '5px', justifyContent: 'center', display: 'flex'}}>object list</div>
                    </div>
                </div>
                <Designer
                    viewSettings={viewSettings}
                    width={window.innerWidth * 0.7}
                    height={window.innerHeight * 0.9}
                    objects={this.state.objects}
                    backgroundUrl={this.image}
                    onUpdate={this.handleUpdate.bind(this)}
                    objectClickHandler={this.objectClickHandler}
                    creationFormHandler={this.creationFormHandler}
                    getTitle={this.getTitle}
                    saveChanges={() => {
                        console.log('Changes was saved')
                    }}
                    layersList={this.state.layersList}
                    getObjectLayer={this.getLayer}
                    saveColors={this.saveColors}
                    accessToRedact={this.state.access}
                />
            </div>
        );
    }
}
