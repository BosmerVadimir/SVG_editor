import React from "react";

class DraggableObjectItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover:false
        }
    };
    toggleHover = () =>{
        this.setState({hover: !this.state.hover})
    };
    render() {
        let {object, getTitle, index, selectedMenuItem, onDoubleClick, onClick, listItemDelete,access,viewMode} = this.props;
        if (!object) {
            return null;
        }
        let isViewMode = viewMode === 'EDIT';
        let itemSelected = (selectedMenuItem, index) => {
            return selectedMenuItem.indexOf(index) !== -1
        };
        let linkStyle;
        if (this.state.hover) {
            linkStyle = styles.deleteButtonHover
        } else {
            linkStyle = styles.deleteButton
        }

        let boxShadow = itemSelected(selectedMenuItem, index) ? 'inset 0 0 5px 0px #1976d2' : 'none';
        let iconDelete = this.props.viewSettings.iconDelete ? this.props.viewSettings.iconDelete : <div> &#128465;</div>;
        let indicator = true;

        return (<div style={{...styles.itemGroup, boxShadow: boxShadow}} onDoubleClick={onDoubleClick} onClick={()=>{onClick(index, indicator)}}>
                    <div style={{display: 'flex', width: '100%'}} >
                        <div>{index + 1}{"."} &#160; </div>
                        <div> {getTitle(object)}</div>
                    </div>
                    {access && isViewMode &&
                    <div  onClick={() => {listItemDelete(object.uuid)}} onMouseOver={this.toggleHover} onMouseOut={this.toggleHover} style={linkStyle}>{iconDelete}</div>}
                </div>
        )
    }
}

const styles = {
    deleteButton:{
        borderRadius: 50,
        color: 'black',
        padding:'0 5px',
        cursor:'pointer'
    },
    deleteButtonHover:{
        borderRadius: 50,
        color: 'white',
        padding:'0 5px',
        cursor:'pointer',
    },
    itemGroup:{
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 4,
        border: '1px solid #d9d9d9',
        margin: 4,
        borderRadius: 4,
        width: 'auto',
    }
};

export default DraggableObjectItem;