// src/motor/Motor.js
export default class Motor {
  constructor(driver) {
    this.driver = driver;
    this.state = {
      retroaviso: false,
      alarme1: false,
      alarme2: false,
      bloqueio: false,
      acionar: false,
    };
    this.listeners = [];
    this.driver.onUpdate((newState) => {
      this.state = newState;
      this._notifyListeners();
    });
  }

  start() {
    this.driver.start();
  }

  stop() {
    this.driver.stop();
  }

  onChange(listener) {
    this.listeners.push(listener);
  }

  _notifyListeners() {
    this.listeners.forEach((l) => l(this.state));
  }
}
