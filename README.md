## Constants

### LEDNum

 * Green1
 * Yellow1
 * Red1
 * Green2
 * Yellow2
 * Red2

### ServoNum

 * Servo1
 * Servo2

## Servos

### setServoPosition(servoNum, degrees)

#### Options:

 * servoNum - Servo number to change the position of, accepts Servo1 or Servo2
 * degrees - Degrees to move the servo to, accepts 0 to 180

## LED's

### toggleLED(ledNum, state)

#### Options:

 * ledNum - LED number to toggle, accepts Green1, Yellow1, Red1, Green2, Yellow2, Red2
 * state - True to turn on, False to turn off

## General

### init(freq)

Initializes the PCA9685 chip with a fixed frequency. Changes the chip frequency to the value passed in between 40Hz and 1000Hz then performs a soft reset on the PCA9685 and sets the output states to all of the outputs to off.

#### Options:

 * freq - Frequency in Hz (default: 50Hz)

### playSpeakerTone(frequency, duration)

Plays a tone on the speaker.

#### Options:

 * frequency - Frequency in Hz (e.g., 440 for A4)
 * duration - Duration in milliseconds

### setDebug(debugEnabled)

Enables or disables debugging output.

#### Options:

 * debugEnabled - True to enable, False to disable

## Example Usage


```
let controller = 0
input.onButtonPressed(Button.A, () => {
    PCA9685.setServoPosition(PCA9685.ServoNum.Servo1, 0)
    basic.showString("A")
})
input.onButtonPressed(Button.B, () => {
    PCA9685.setServoPosition(PCA9685.ServoNum.Servo1, 180)
    basic.showString("B")
})
input.onButtonPressed(Button.AB, () => {
    PCA9685.setServoPosition(PCA9685.ServoNum.Servo1, 90)
    basic.showString("C")
})
controller = 0x40
basic.showNumber(controller)
PCA9685.init(60)
```

## License

MIT

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)


```package
https://github.com/Funduino-GmbH/FunduinoRailway
```