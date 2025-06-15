// src/drivers/SimulatedMotorDriver.js
import IMotorDriver from './IMotorDriver';

export default class SimulatedMotorDriver extends IMotorDriver {
  constructor() {
    super();
    this.state = {
      retroaviso: false,
      alarme1: false,
      alarme2: false,
      bloqueio: false,
      acionar: false,
    };
    this.updateCallback = null;
  }

  start() {
    this.state.acionar = true;

    // Simula delay e depois seta retroaviso
    setTimeout(() => {
      this.state.retroaviso = true;
      this._notifyUpdate();
    }, 1000);
  }

  stop() {
    this.state.acionar = false;
    this.state.retroaviso = false;
    this._notifyUpdate();
  }

  onUpdate(callback) {
    this.updateCallback = callback;
    // Pode enviar estado inicial
    this._notifyUpdate();
  }

  _notifyUpdate() {
    if (this.updateCallback) {
      this.updateCallback({ ...this.state });
    }
  }
}
