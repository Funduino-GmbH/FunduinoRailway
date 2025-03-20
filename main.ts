/**
 * FunduinoRailway Library for controlling LEDs, servos, and a speaker.
 */
//% color="#cfbf1f" weight=100 icon="\uf1b3" block="Funduino Railway"
//% groups=["Initialization", "LED Control", "Servo Control", "Speaker Control"]
namespace FunduinoRailway {
    let _DEBUG: boolean = false;

    const debug = (msg: string) => {
        if (_DEBUG === true) {
            serial.writeLine(msg);
        }
    };

    const CHIP_ADDRESS = 0x40; // Fixed chip address
    const chipResolution = 4096;

    const PrescaleReg = 0xFE; // Prescale register address
    const modeRegister1 = 0x00; // MODE1
    const modeRegister2 = 0x01; // MODE2
    const sleep = 0x10; // Set sleep bit to 1
    const wake = 0x00; // Set sleep bit to 0
    const restart = 0x80; // Set restart bit to 1

    const allChannelsOnStepLowByte = 0xFA; // ALL_LED_ON_L
    const allChannelsOnStepHighByte = 0xFB; // ALL_LED_ON_H
    const allChannelsOffStepLowByte = 0xFC; // ALL_LED_OFF_L
    const allChannelsOffStepHighByte = 0xFD; // ALL_LED_OFF_H

    const channel0OnStepLowByte = 0x06; // LED0_ON_L
    const channel0OnStepHighByte = 0x07; // LED0_ON_H
    const channel0OffStepLowByte = 0x08; // LED0_OFF_L
    const channel0OffStepHighByte = 0x09; // LED0_OFF_H

    const PinRegDistance = 4;

    export enum LEDNum {
        //% block="Green 1"
        //% block.loc.de="Grün 1"
        Green1 = 1,
        //% block="Yellow 1"
        //% block.loc.de="Gelb 1"
        Yellow1 = 2,
        //% block="Red 1"
        //% block.loc.de="Rot 1"
        Red1 = 3,
        //% block="Green 2"
        //% block.loc.de="Grün 2"
        Green2 = 4,
        //% block="Yellow 2"
        //% block.loc.de="Gelb 2"
        Yellow2 = 5,
        //% block="Red 2"
        //% block.loc.de="Rot 2"
        Red2 = 6,
    }

    export enum ServoNum {
        Servo1 = 0,
        Servo2 = 7,
    }

    export class ServoConfig {
        pinNumber: number;
        minOffset: number;
        maxOffset: number;

        constructor(pinNumber: number, minOffset: number, maxOffset: number) {
            this.pinNumber = pinNumber;
            this.minOffset = minOffset;
            this.maxOffset = maxOffset;
        }
    }

    const servos: { [key: number]: ServoConfig } = {
        [ServoNum.Servo1]: new ServoConfig(0, 5, 25), // Servo 1 on LED0
        [ServoNum.Servo2]: new ServoConfig(7, 5, 25), // Servo 2 on LED7
    };

    function calcFreqPrescaler(freq: number): number {
        return Math.floor((25000000 / (freq * chipResolution)) - 1);
    }

    function write(register: number, value: number): void {
        const buffer = pins.createBuffer(2);
        buffer[0] = register;
        buffer[1] = value;
        pins.i2cWriteBuffer(CHIP_ADDRESS, buffer, false);
    }

    function setPinPulseRange(pinNumber: number, onStep: number, offStep: number): void {
        const pinOffset = PinRegDistance * pinNumber;

        write(pinOffset + channel0OnStepLowByte, onStep & 0xFF); // Low byte of onStep
        write(pinOffset + channel0OnStepHighByte, (onStep >> 8) & 0x0F); // High byte of onStep
        write(pinOffset + channel0OffStepLowByte, offStep & 0xFF); // Low byte of offStep
        write(pinOffset + channel0OffStepHighByte, (offStep >> 8) & 0x0F); // High byte of offStep
    }

    /**
     * Initializes the PCA9685 chip with a fixed frequency.
     * @param freq Frequency in Hz (default: 50Hz)
     */
    //% block="initialize PCA9685 at $freq Hz"
    //% block.loc.de="PCA9685 initialisieren bei $freq Hz"
    //% groups=['Initialization']
    export function init(freq: number = 50): void {
        const prescaler = calcFreqPrescaler(freq);

        write(modeRegister1, sleep); // Enter sleep mode
        write(PrescaleReg, prescaler); // Set prescaler
        write(allChannelsOnStepLowByte, 0x00); // Turn off all channels
        write(allChannelsOnStepHighByte, 0x00);
        write(allChannelsOffStepLowByte, 0x00);
        write(allChannelsOffStepHighByte, 0x00);
        write(modeRegister1, wake); // Wake up
        basic.pause(1000); // Wait for oscillator to stabilize
        write(modeRegister1, restart); // Restart oscillator
    }

    /**
     * Toggles an LED on or off.
     * @param ledNum LED number (Green1, Yellow1, Red1, Green2, Yellow2, Red2)
     * @param state True to turn on, False to turn off
     */
    //% block="should LED $ledNum be on? $state"
    //% block.loc.de="soll LED $ledNum an sein? $state"
    //% groups=['LED Control']
    export function toggleLED(ledNum: LEDNum, state: boolean): void {
        const pinNumber = ledNum - 1; // Convert LED number to pin number
        const offStep = state ? chipResolution - 1 : 0;

        setPinPulseRange(pinNumber, 0, offStep);
    }

    /**
     * Sets the position of a servo.
     * @param servoNum Servo number (Servo1, Servo2)
     * @param degrees Position in degrees (0-180)
     */
    //% block="set servo $servoNum to $degrees degrees"
    //% block.loc.de="Setze Servo $servoNum auf $degrees Grad"
    //% groups=['Servo Control']
    export function setServoPosition(servoNum: ServoNum, degrees: number): void {
        const servo = servos[servoNum];
        const offsetStart = servo.minOffset;
        const offsetEnd = servo.maxOffset;
        const spread = offsetEnd - offsetStart;
        const pwm = Math.floor(((degrees * spread) / 180) + offsetStart);

        setPinPulseRange(servo.pinNumber, 0, pwm);
    }

    /**
     * Plays a tone on the speaker.
     * @param frequency Frequency in Hz (e.g., 440 for A4)
     * @param duration Duration in milliseconds
     */
    //% block="play tone $frequency Hz for $duration ms"
    //% block.loc.de="Spiele einen Ton mit $frequency Hz für $duration ms"
    //% groups=['Speaker Control']
    export function playSpeakerTone(frequency: number, duration: number): void {
        const pinNumber = 8; // Speaker on LED8
        const onStep = 0;
        const offStep = Math.floor((chipResolution * frequency) / 1000);

        setPinPulseRange(pinNumber, onStep, offStep);
        basic.pause(duration);
        setPinPulseRange(pinNumber, 0, 0); // Turn off speaker
    }

    /**
     * Enables or disables debugging output.
     * @param debugEnabled True to enable, False to disable
     */
    //% block="set debug mode $debugEnabled"
    //% block.loc.de="Setze Debug-Modus auf $debugEnabled"
    //% advanced=true
    export function setDebug(debugEnabled: boolean): void {
        _DEBUG = debugEnabled;
    }
}