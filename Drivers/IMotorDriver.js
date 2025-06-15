export default class IMotorDriver {
  start() {
    throw new Error('start() with no implementation');
  }
  stop() {
    throw new Error('stop() with no implementation');
  }
  onUpdate(callback) {
    throw new Error('onUpdate()  with no implementation');
  }
}
