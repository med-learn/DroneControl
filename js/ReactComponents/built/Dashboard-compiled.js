const React = require('React');
const ReactDOM = require('React-dom');

//const MainController = require(__dirname + '\\..\\..\\modules\\MainControllerModule');

var Dashboard = React.createClass({
    initCamera: function () {
        //call to controller
    },
    connectToDrone: function () {
        //call to controller
    },
    setStatus: function () {
        //emergency status
        //battery status
    },
    startDemo: function () {
        //call to controller
    },
    takeoff: function () {
        controller.takeoff();
    },
    render: function () {
        return React.createElement('div', null, React.createElement('h1', { style: { color: 'white' } }, 'Dashboard'), React.createElement('div', { className: 'checkbox checkbox-slider--b-flat' }, React.createElement('label', null, React.createElement('input', { type: 'checkbox' }), React.createElement('span', null, 'RS Camera'))), React.createElement('div', { className: 'checkbox checkbox-slider--b-flat' }, React.createElement('label', null, React.createElement('input', { type: 'checkbox' }), React.createElement('span', null, 'Connect to ARDrone'))), React.createElement('div', null, React.createElement('button', { type: 'button', className: 'btn btn-primary btn-lg btn-block', onClick: this.takeoff }, 'Take Off'), ' ', React.createElement('button', { type: 'button', className: 'btn btn-warning btn-lg btn-block' }, 'Reset Drone')), React.createElement('div', null, React.createElement('h2', null, 'Status: ', React.createElement('span', { className: 'glyphicon glyphicon-thumbs-up', 'aria-hidden': 'true' })), React.createElement('span', { id: 'status_message' }), React.createElement('div', { className: 'progress' }, React.createElement('div', { className: 'progress-bar progress-bar-danger', role: 'progressbar', 'aria-valuenow': '70',
            'aria-valuemin': '0', 'aria-valuemax': '100', style: { width: 70 } }, '70%'))));
    }
});

var init = function () {
    ReactDOM.render(React.createElement(Dashboard, null), document.getElementById('dashboard'));
};

init();

module.exports.Dashbaord = Dashboard;

//# sourceMappingURL=Dashboard-compiled.js.map