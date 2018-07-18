const ServerController = require('./servercontroller');

const controller = new ServerController(5, 0.5, 5);

controller.startCycle();
