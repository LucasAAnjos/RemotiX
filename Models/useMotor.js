// src/hooks/useMotor.js
import { useState, useEffect, useRef } from 'react';
import Motor from './Motor';
import SimulatedMotorDriver from '../Drivers/MotorSimulation';

export function useMotor() {
  const [state, setState] = useState({
    retroaviso: false,
    alarme1: false,
    alarme2: false,
    bloqueio: false,
    acionar: false,
  });

  const motorRef = useRef(null);

  useEffect(() => {
    const driver = new SimulatedMotorDriver();
    const motor = new Motor(driver);

    motor.onChange((newState) => {
      setState(newState);
    });

    motorRef.current = motor;

    return () => {
      motorRef.current = null; // cleanup se precisar
    };
  }, []);

  const ligar = () => {
    motorRef.current?.start();
  };

  const desligar = () => {
    motorRef.current?.stop();
  };

  return { ...state, ligar, desligar };
}
