const React = require('React');
const ReactDOM = require('React-dom');

//const MainController = require(__dirname + '\\..\\..\\modules\\MainControllerModule');


var Dashboard = React.createClass({
    initCamera: function(){
        //call to controller
    },
    connectToDrone: function(){
        //call to controller
    },
    setStatus:function(){
        console.log("status");
        //emergency status
        //battery status
    },
    startDemo: function(){
      //call to controller
    },
    takeoff: function(){
        controller.takeoff();
    },
    render: function() {
        return (
            <div>
                <h1 style={{color: 'white'}}>Dashboard</h1>

                <div className="checkbox checkbox-slider--b-flat">
                    <label>
                        <input type="checkbox" /><span>RS Camera</span>
                    </label>
                </div>

                <div className="checkbox checkbox-slider--b-flat">
                    <label>
                        <input type="checkbox"/><span>Connect to ARDrone</span>
                    </label>
                </div>

                <div>
                    <button type="button" className="btn btn-primary btn-lg btn-block" onClick={this.takeoff}>Take Off</button> {/* TODO: change to take off button */ }
                    <button type="button" className="btn btn-warning btn-lg btn-block">Reset Drone</button>
                </div>

                <div>
                    <h2>Status: <span className="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span></h2>

                    <span id="status_message"></span>
                    <div className="progress">
                        <div className="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="70"
                             aria-valuemin="0" aria-valuemax="100" style={{width:70}}>
                            70%
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var init = function(){
    ReactDOM.render(<Dashboard />,
        document.getElementById('dashboard'));
};

init();

module.exports.Dashbaord = Dashboard;

