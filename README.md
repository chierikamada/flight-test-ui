# flight-test-ui
Generic React Components for Flight Test / Control Room Use. 

## Init
Run `npm install` to install dependencies

## Demo
To see the components in action and edit with HMR, run `npm run dev` and go to <http://localhost:5173/>

## Components (WIP)
### G-1000 style PFD

```html
<PFD altitude={mockAltitude} airspeed={mockAirspeed} pitch={mockPitch} roll={mockRoll}/>
```

<img width="400" height="303" alt="Screencast from 2026-11-06 13-10-38" src="https://github.com/user-attachments/assets/22d4fc3b-d52a-4f87-b536-42d990b7efac" />

### Stopwatch (Manual Mode + Automatic Mode w/ Threshold)

```html
<Stopwatch label="Alt > 1000 ft" value={mockAltitude.value} thresholdType="above" thresholdVal={1000} resetBetween={true} />
```

<img width="300" alt="Screencast from 2026-11-06 13-11-11" src="https://github.com/user-attachments/assets/61029df7-620c-4d27-966e-c342a67cf45f" />


### Value Readout
```html
<ValueReadout dataPoint={mockPitch} label="Pitch" unit="deg" decimalPoint={1}/>
<ValueReadout dataPoint={mockRoll} label="Roll" unit="deg" decimalPoint={1}/>
```

<img width="250" alt="Screencast from 2026-11-06 13-08-10" src="https://github.com/user-attachments/assets/aa4462a4-02fb-43a6-bf65-beaaf12def42" />


### Moving Plot
```html
<MovingChart dataPoint={mockAltitude} title="Altitude" yLabel='Feet'/>
```

<img width="500" alt="Screencast from 2026-11-06 13-08-28" src="https://github.com/user-attachments/assets/bf544f74-b7df-45ff-8087-d80930f8ae91" />
