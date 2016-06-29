var arDrone = require('ar-drone');
var control = arDrone.createUdpControl();

var ind=0;
setInterval(function() {
  if(ind>40){
  // The emergency: true option recovers your drone from emergency mode that can
  // be caused by flipping it upside down or the drone crashing into something.
  // In a real program you probably only want to send emergency: true for one
  // second in the beginning, otherwise your drone may attempt to takeoff again
  // after a crash.
  control.ref({fly: true, emergency: true});
  // This command makes sure your drone hovers in place and does not drift.
  control.pcmd();
  // This causes the actual udp message to be send (multiple commands are
  // combined into one message)
  control.flush();
  }
ind++;
}, 30);