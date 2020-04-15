import React, {Component} from 'react';
import Tooltip from "@material-ui/core/Tooltip";

class InsertMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuOpened: false,
            hoveredTool: null,
            zoom: 1,
        }
    }
    openMenu = () => {
        this.setState({menuOpened: true})
    };
    closeMenu = () => {
        this.setState({menuOpened: false})
    };
    hoverTool = type => {
        this.setState({hoveredTool: type})
    };
    unhoverTool = type => {
        if (this.state.hoveredTool === type) {
            this.setState({hoveredTool: null})
        }
    };
    handlerZoomPlus = () => {
        let zoom = this.props.zoom;
        if (zoom < 5) {
            this.props.zooming(zoom + 1, 'plus')
        }
    };
    handlerZoomMinus = () => {
        const {zoom, zooming, initZoom} = this.props;
        if (zoom > initZoom , "minus") {
            zooming(zoom - 1)
        } else {
            return
        }
    };
    handlerZoomToNull = () => {
        let initZoom = this.props.initZoom;
        this.setState({zoom: initZoom});
        this.props.zooming(initZoom);
        this.props.handleMoveToCenter()
    };

    render() {
        let {currentTool, tools, viewMode, setReadMode, setEditMode, handleMoveToCenter, saveChanges, handlerLayerDialog, zoom, access, viewSettings} = this.props;
        let {menuOpened, hoveredTool} = this.state;
        // let keys = Object.keys(tools);
        const iconSave = viewSettings && viewSettings.iconSave ? viewSettings.iconSave : <div>&#128190; </div>;
        const iconEditMode = viewSettings && viewSettings.iconEditMode
            ? viewSettings.iconEditMode :
            <div>&#128736; </div>;
        const iconViewMode = viewSettings && viewSettings.iconViewMode
            ? viewSettings.iconViewMode :
            <div>&#128269; </div>;
        const iconCircle = viewSettings && viewSettings.iconCircle
            ? viewSettings.iconCircle :
            <div style={{display: 'flex', alignItems: 'center', height: 18, overflow: "hidden"}}>
                <div style={{fontSize: 60}}>&#8226;</div>
            </div>;
        const iconRectangle = viewSettings && viewSettings.iconRectangle
            ? viewSettings.iconRectangle :
            <div>&#x25A0; </div>;
        const iconPolyObject = viewSettings && viewSettings.iconPolyObject
            ? viewSettings.iconPolyObject :
            <div>&#x394; </div>;
        const iconObjectList = viewSettings && viewSettings.iconObjectList
            ? viewSettings.iconObjectList :
            <div>&#x39E; </div>;

        return (
            <div style={styles.insertMenu}>
                <div style={styles.icon} onClick={handlerLayerDialog}>{iconObjectList}</div>
                <Tooltip title={'Zoom'} placement="right">
                    <div onClick={this.handlerZoomToNull}
                         style={{
                             ...styles.icon,
                             fontSize: 12,
                             height: 40,
                             width: 40,
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             borderRadius: '30px',
                             boxShadow: '0 1px 10px 0px rgba(0, 0, 0, 0.5)',
                         }}>
                        <div style={{fontSize: 10}}>x</div>
                        <div>{parseFloat(zoom.toFixed(1))}</div>
                    </div>
                </Tooltip>

                {viewMode === "EDIT" && access &&
                <div onClick={setReadMode}
                     style={viewMode !== "EDIT" ? styles.iconsSelected : styles.icon}>{iconViewMode}</div>}
                {viewMode !== "EDIT" && access &&
                <div onClick={setEditMode}
                     style={viewMode === "EDIT" ? styles.iconsSelected : styles.icon}>{iconEditMode}</div>}
                {access && viewMode === "EDIT" && <div>
                    <div title={"rectangle"}
                         style={{...styles.icon}}
                         onMouseOver={() => this.hoverTool('rectangle')}
                         onMouseOut={() => this.unhoverTool('rectangle')}
                         onMouseDown={this.props.onSelect.bind(this, 'rectangle')}>
                        {iconRectangle}
                    </div>
                    <div title={"circle"}
                         style={{...styles.icon}}
                         onMouseOver={() => this.hoverTool('circle')}
                         onMouseOut={() => this.unhoverTool('circle')}
                         onMouseDown={this.props.onSelect.bind(this, 'circle')}>
                        {iconCircle}
                    </div>
                    <div title={"polygon"}
                         style={{...styles.icon}}
                         onMouseOver={() => this.hoverTool('polygon')}
                         onMouseOut={() => this.unhoverTool('polygon')}
                         onMouseDown={this.props.onSelect.bind(this, 'polygon')}>
                        {iconPolyObject}
                    </div>
                </div>
                }
                {access && viewMode === "EDIT" && <div onClick={saveChanges} style={styles.icon}>{iconSave}</div>}
            </div>
        );
    }
}

const styles = {
    insertMenu: {
        display: 'flex',
        justifyContent: 'start',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fbfbfb',
        margin: '0 5px',
        width: 'auto',
        height: 'auto',
        borderRadius: '4px',
        boxShadow: '1px 0 5px 0 gray'
    },
    insertMenuHover: {
        background: '#fbfbfb',
        height: 'auto',
    },
    toolBox: {
        margin: 0,
        padding: 0,
    },
    toolBoxItem: {
        listStyle: "none",
        padding: "5px 5px"
    },
    currentToolboxItem: {
        color: '#1890ff'
    },
    icons: {
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: 4,
        margin: 5
    },
    iconsSelected: {
        border: '1px solid #d9d9d9',
        textAlign: 'center',
        fontSize: '21px',
        cursor: 'pointer',
        borderRadius: 4,
        margin: 5,
        color: '#1890ff'
    },
    iconsContainer: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        borderBottom: "1px solid #e0e0e0",
    }

};

export default InsertMenu;
