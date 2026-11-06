import './App.css'
import { useEffect, useState } from 'react'
import { ValueReadout } from '../lib/components/ValueReadout'
import { MovingChart } from '../lib/components/MovingChart'
import { PFD } from '../lib/components/PFD'
import { Stopwatch } from '../lib/components/Stopwatch'
import type { DataPoint } from '../lib/states/dataPoint'


function App() {
  const [mockAltitude, setMockAltitude] = useState<DataPoint>({time: new Date(), value: 0});
  const [mockAirspeed, setMockAirspeed] = useState<DataPoint>({time: new Date(), value: 0});
  const [mockPitch, setMockPitch] = useState<DataPoint>({time: new Date(), value: 0});
  const [mockRoll, setMockRoll] = useState<DataPoint>({time: new Date(), value: 0});

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setMockAltitude({time: now, value: 1000+1000*Math.sin((now.getTime() % 80000)/80000*2*Math.PI)});
      setMockAirspeed({time: now, value: 100+100*Math.sin((now.getTime() % 40000)/40000*2*Math.PI)});
      setMockPitch({time: now, value: 50*Math.sin((now.getTime() % 20000)/20000*2*Math.PI)});
      setMockRoll({time: now, value: 30*Math.sin((now.getTime() % 20000)/20000*2*Math.PI)});
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <section>
        <div className="text-left m-4">ValueReadout</div>
        <div className="m-4 flex flex-col gap-2">
          <ValueReadout dataPoint={mockPitch} label="Pitch" unit="deg" decimalPoint={1}/>
          <ValueReadout dataPoint={mockRoll} label="Roll" unit="deg" decimalPoint={1}/>
        </div>
        
      </section>
      <section>
        <div className="text-left m-4">MovingChart</div>
        <MovingChart dataPoint={mockAltitude} title="Altitude" yLabel='Feet'/>
      </section>
      <section>
        <div className="text-left m-4">PFD</div>
        <PFD altitude={mockAltitude} airspeed={mockAirspeed} pitch={mockPitch} roll={mockRoll}/>
      </section>
      <section>
        <div className="text-left m-4">StopWatch</div>
        <Stopwatch label="Alt > 1000 ft" value={mockAltitude.value} thresholdType="above" thresholdVal={1000} resetBetween={true} />
      </section>
      <section id="spacer"></section>
    </>
  )
}

export default App
