import { Stage, Layer, Group, Arc, Circle, Rect, Line, Text, RegularPolygon } from 'react-konva';
import type { DataPoint } from "../states/dataPoint";

type PFDProps = {
    altitude: DataPoint, 
    airspeed: DataPoint,
    pitch: DataPoint,
    roll: DataPoint,
}

export function PFD({altitude, airspeed, pitch, roll}: PFDProps) {
    const width = 400;
    const height = 300;
    return (
        <Stage width={width} height={300}>
            <Layer>
                <ArtificialHorizon width={width} height={height} pitch={pitch.value} roll={roll.value}/>

                <Group x={330} y={25}>
                    <AltitudeTape value={altitude.value} min={0} max={10000} majorTick={100} minorTick={10}/>
                </Group>

                <Group x={0} y={25}>
                    <SpeedTape value={airspeed.value} min={0} max={500} majorTick={10} minorTick={1}/>
                </Group>
            </Layer>
        </Stage>
    )
} 

function ArtificialHorizon({width, height, pitch, roll}: {width: number, height: number, pitch: number, roll:number}) {
    const arcRadius = 100;
    const majorBankAngles = [-60, -30, 0, 30, 60];
    const minorBankAngles = [-45, -20, -10, 10, 20, 45];
    const ladderAngles = [-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60];

    function calculateArcTicks(angle: number, tickLength: number): number[] {
        let angle_rad = angle / 360 * 2 * Math.PI;
        return [width/2+arcRadius*Math.sin(angle_rad), height/2-arcRadius*Math.cos(angle_rad),
            width/2+(arcRadius+tickLength)*Math.sin(angle_rad), height/2-(arcRadius+tickLength)*Math.cos(angle_rad)]
    }

    return (
        <Group clip={{x: 0, y: 0, width: width, height: height}}>
            <Group 
                x={width / 2}
                y={height / 2}
                offsetX={width / 2}
                offsetY={height / 2}
                rotation={roll}
            >

                {/* Background Rectangles */}
                <Group>
                    <Rect x={-width/2} y={-height/2} width={width*2} height={height} fill="#78acd0"/>
                    <Rect x={-width/2} y={height/2} width={width*2} height={height} fill="#493122"/>
                </Group>


                {/* Horizonal Line */}
                <Line points={[-width/2,height/2,1.5*width,height/2]} stroke="white"/>

            
                {/* Bank Indicator */}
                <Group>
                    <Arc x={width/2} y={height/2} innerRadius={arcRadius} outerRadius={arcRadius} angle={120} rotation={-150} stroke="white"/>
                    { majorBankAngles.map((angle) => 
                        <Line points={calculateArcTicks(angle,15)} stroke="white"/>
                    )}
                    { minorBankAngles.map((angle) => 
                        <Line points={calculateArcTicks(angle,8)} stroke="white"/>
                    )}
                </Group>

                {/* Pitch Ladder */}
                <Group clipFunc={(ctx)=>{
                    ctx.beginPath();
                    ctx.arc(width/2,height/2,arcRadius,0,2*Math.PI)
                }}>
                    <Group offsetY={-pitch*4}>
                        { ladderAngles.map((angle) => 
                            <>
                                <Line points={[width/2-35,height/2-angle*4,width/2+35,height/2-angle*4]} stroke="white" lineCap="round"/>
                                <Text text={`${angle}`} x={width/2-60} y={height/2-angle*4} offsetY={5} fill="white" width={20} align="right"/>
                            </>
                        )}
                    </Group>
                </Group>
            </Group>

            {/* Stationary Markers */}
            <RegularPolygon x={width/2} y={height/2-arcRadius} sides={3} radius={9} offsetY={-9.5} fill="white" stroke="#515151" strokeWidth={0.8}/>
            <Line points={[width/2-120,height/2,width/2-70,height/2]} stroke="orange" strokeWidth={4}/>
            <Line points={[width/2+70,height/2,width/2+120,height/2]} stroke="orange" strokeWidth={4}/>
            <Circle x={width/2} y={height/2} radius={4} fill="orange"/>
        </Group>
    )
}

type TapeProps = {
    value: number, 
    min: number, 
    max: number, 
    majorTick: number, 
    minorTick: number
}

function AltitudeTape({value, min, max, majorTick, minorTick}: TapeProps) {

    const height = 250;
    const width = 70;
    const scale = height / (3.5 * majorTick); // pixel per value

    const tick_1 = (Math.floor(value / majorTick) + 2) * majorTick;
    const tick_2 = (Math.floor(value / majorTick) + 1) * majorTick;
    const tick_3 = (Math.floor(value / majorTick)) * majorTick;
    const tick_4 = (Math.floor(value / majorTick) - 1) * majorTick;

    function majorTickYPos(tick: number): number {
        return (value - tick) * scale + 0.5 * height;
    }

    // Sub-ticks: divide each major interval into 10, covering the visible range
    // (±1.75 majorTick around value) plus margin; skip positions of major ticks.
    const subTickStep = majorTick / 10;
    const subTickStart = (Math.floor(value / majorTick) - 2) * majorTick;
    const subTicks: number[] = [];
    for (let i = 0; i <= 50; i++) {
        if (i % 10 === 0) continue;
        const tick = subTickStart + i * subTickStep;
        if (tick >= min && tick <= max) subTicks.push(tick);
    }

    const minorTickScale = 1.7; // pixel per value
    const minorValue = value % (minorTick*10);
    const minorTickBase = Math.floor(minorValue / minorTick)
    const minorTick1 = (minorTickBase + 2) * minorTick;
    const minorTick2 = (minorTickBase + 1) * minorTick;
    const minorTick3 = (minorTickBase) * minorTick;
    const minorTick4 = (minorTickBase - 1) * minorTick;

    function minorTickYPos(tick: number): number {
        return (minorValue - tick) * minorTickScale + 0.5 * height;
    }

    // Cyclic label: wraps into [0, minorTick*10), e.g. -10 -> 90, 100 -> 00
    // Zero-padded to the width of the largest label (e.g. 90 -> 2 digits)
    function minorTickLabel(tick: number): string {
        const period = minorTick * 10;
        const digits = String(period - minorTick).length;
        return String(((tick % period) + period) % period).padStart(digits, "0");
    }

    // Fixed digits roll like a drum counter: they stay put until the minor digits
    // enter their last interval (e.g. 90 -> 00), then roll in sync with them.
    const fixedPeriod = minorTick * 10;
    const fixedValue = Math.floor(value / fixedPeriod);
    const fixedRemainder = value - fixedValue * fixedPeriod; // always in [0, fixedPeriod)
    const fixedRollStart = fixedPeriod - minorTick;
    const fixedRollFrac = fixedRemainder > fixedRollStart ? (fixedRemainder - fixedRollStart) / minorTick : 0;
    const fixedSpacing = minorTick * minorTickScale; // same pixel spacing as minor digits

    function fixedDigitYPos(offset: number): number {
        // offset 0 = current fixed value, offset 1 = next value (enters from above)
        return 0.5 * height + (fixedRollFrac - offset) * fixedSpacing;
    }
    return(
        <Group>
            <Rect width={width} height={height} stroke="lightgray" strokeWidth={1} fill="#ffffff20" cornerRadius={3}/>

            <Group clip={{x: 0, y: 0, width: width, height: height}}>
                {subTicks.map(tick => (
                    <Line key={tick} points={[0,majorTickYPos(tick),7,majorTickYPos(tick)]} stroke="white" strokeWidth={1}/>
                ))}
            

                { tick_1 <= max && tick_1 >= min &&
                    <>
                        <Line points={[0,majorTickYPos(tick_1),20,majorTickYPos(tick_1)]} stroke="white"/>
                        <Text text={`${tick_1}`} x={width-45} y={majorTickYPos(tick_1)} offsetY={7} width={40} align="right" fill="white" fontSize={15}/>
                    </>
                }
                
                { tick_2 <= max && tick_2 >= min &&
                    <>
                        <Line points={[0,majorTickYPos(tick_2),20,majorTickYPos(tick_2)]} stroke="white"/>
                        <Text text={`${tick_2}`} x={width-45} y={majorTickYPos(tick_2)} offsetY={7} width={40} align="right" fill="white" fontSize={15}/>
                    </>
                }

                { tick_3 <= max && tick_3 >= min &&
                    <>
                        <Line points={[0,majorTickYPos(tick_3),20,majorTickYPos(tick_3)]} stroke="white"/>
                        <Text text={`${tick_3}`} x={width-45} y={majorTickYPos(tick_3)} offsetY={7} width={40} align="right" fill="white" fontSize={15}/>
                    </>
                }

                { tick_4 <= max && tick_4 >= min &&
                    <>
                        <Line points={[0,majorTickYPos(tick_4),20,majorTickYPos(tick_4)]} stroke="white"/>
                        <Text text={`${tick_4}`} x={width-45} y={majorTickYPos(tick_4)} offsetY={7} width={40} align="right" fill="white" fontSize={15}/>
                    </>
                }
            </Group>
            

            <Line points={[
                width-2, height/2-22,
                width-30, height/2-22,
                width-30, height/2-12,
                8, height/2-12,
                8, height/2-5,
                0, height/2,
                8, height/2+5,
                8, height/2+12, 
                width-30, height/2+12,
                width-30, height/2+22, 
                width-2, height/2+22
                ]} fill="black" stroke="white" strokeWidth={1} closed={true} 
            />

            {/* Readout - fixed digits */}
            <Group clip={{x:8, y:height/2-11, width: 40, height: 22}}>
                <Text text={`${(fixedValue) || ""}`} x={0} y={fixedDigitYPos(0)} width={40} offsetY={10} fill="white" align="right" fontSize={18}/>
                <Text text={`${(fixedValue + 1) || ""}`} x={0} y={fixedDigitYPos(1)} width={40} offsetY={10} fill="white" align="right" fontSize={18}/>
            </Group>

            <Group clip={{x:width-30, y:height/2-20, width: 25, height: 40}}> 
                <Text text={minorTickLabel(minorTick1)} x={width-30} y={minorTickYPos(minorTick1)} width={25} offsetY={10} fill="white" align="right" fontSize={18}/>
                <Text text={minorTickLabel(minorTick2)} x={width-30} y={minorTickYPos(minorTick2)} width={25} offsetY={10} fill="white" align="right" fontSize={18}/>
                <Text text={minorTickLabel(minorTick3)} x={width-30} y={minorTickYPos(minorTick3)} width={25} offsetY={10} fill="white" align="right" fontSize={18}/>
                <Text text={minorTickLabel(minorTick4)} x={width-30} y={minorTickYPos(minorTick4)} width={25} offsetY={10} fill="white" align="right" fontSize={18}/>
            </Group>
            
        </Group>
    )
}

function SpeedTape({value, min, max, majorTick, minorTick}: TapeProps) {
    const height = 250;
    const width = 70;
    const scale = height / (6 * majorTick); // pixel per value

    const tick_1 = (Math.floor(value / majorTick) + 3) * majorTick;
    const tick_2 = (Math.floor(value / majorTick) + 2) * majorTick;
    const tick_3 = (Math.floor(value / majorTick) + 1) * majorTick;
    const tick_4 = (Math.floor(value / majorTick)) * majorTick;
    const tick_5 = (Math.floor(value / majorTick) - 1) * majorTick;
    const tick_6 = (Math.floor(value / majorTick) - 2) * majorTick;

    function majorTickYPos(tick: number): number {
        return (value - tick) * scale + 0.5 * height;
    }

    // Sub-ticks: divide each major interval into 2, covering the visible range
    // (±1.75 majorTick around value) plus margin; skip positions of major ticks.
    const subTickStep = majorTick / 2;
    const subTickStart = (Math.floor(value / majorTick) - 2) * majorTick;
    const subTicks: number[] = [];
    for (let i = 0; i <= 12; i++) {
        if (i % 2 === 0) continue;
        const tick = subTickStart + i * subTickStep;
        if (tick >= min && tick <= max) subTicks.push(tick);
    }

    const minorTickScale = 17; // pixel per value
    const minorValue = value % (minorTick*10);
    const minorTickBase = Math.floor(minorValue / minorTick)
    const minorTick1 = (minorTickBase + 2) * minorTick;
    const minorTick2 = (minorTickBase + 1) * minorTick;
    const minorTick3 = (minorTickBase) * minorTick;
    const minorTick4 = (minorTickBase - 1) * minorTick;

    function minorTickYPos(tick: number): number {
        return (minorValue - tick) * minorTickScale + 0.5 * height;
    }

    // Cyclic label: wraps into [0, minorTick*10), e.g. -10 -> 90, 100 -> 00
    // Zero-padded to the width of the largest label (e.g. 90 -> 2 digits)
    function minorTickLabel(tick: number): string {
        const period = minorTick * 10;
        const digits = String(period - minorTick).length;
        return String(((tick % period) + period) % period).padStart(digits, "0");
    }

    // Fixed digits roll like a drum counter: they stay put until the minor digits
    // enter their last interval (e.g. 90 -> 00), then roll in sync with them.
    const fixedPeriod = minorTick * 10;
    const fixedValue = Math.floor(value / fixedPeriod);
    const fixedRemainder = value - fixedValue * fixedPeriod; // always in [0, fixedPeriod)
    const fixedRollStart = fixedPeriod - minorTick;
    const fixedRollFrac = fixedRemainder > fixedRollStart ? (fixedRemainder - fixedRollStart) / minorTick : 0;
    const fixedSpacing = minorTick * minorTickScale; // same pixel spacing as minor digits

    function fixedDigitYPos(offset: number): number {
        // offset 0 = current fixed value, offset 1 = next value (enters from above)
        return 0.5 * height + (fixedRollFrac - offset) * fixedSpacing;
    }

    return(
        <Group>
            <Rect width={width} height={height} stroke="lightgray" strokeWidth={1} fill="#ffffff20" cornerRadius={3}/>

            <Group clip={{x: 0, y: 0, width: width, height: height}}>
                {subTicks.map(tick => (
                    <Line key={tick} points={[width,majorTickYPos(tick),width-7,majorTickYPos(tick)]} stroke="white" strokeWidth={1}/>
                ))}

                { tick_1 <= max && tick_1 >= min &&
                    <>
                        <Line points={[width-15,majorTickYPos(tick_1),width,majorTickYPos(tick_1)]} stroke="white"/>
                        <Text text={`${tick_1}`} x={10} y={majorTickYPos(tick_1)} offsetY={7} width={30} align="right" fill="white" fontSize={15}/>
                    </>
                }
                
                { tick_2 <= max && tick_2 >= min &&
                    <>
                        <Line points={[width-15,majorTickYPos(tick_2),width,majorTickYPos(tick_2)]} stroke="white"/>
                        <Text text={`${tick_2}`} x={10} y={majorTickYPos(tick_2)} offsetY={7} width={30} align="right" fill="white" fontSize={15}/>
                    </>
                }

                { tick_3 <= max && tick_3 >= min &&
                    <>
                        <Line points={[width-15,majorTickYPos(tick_3),width,majorTickYPos(tick_3)]} stroke="white"/>
                        <Text text={`${tick_3}`} x={10} y={majorTickYPos(tick_3)} offsetY={7} width={30} align="right" fill="white" fontSize={15}/>
                    </>
                }

                { tick_4 <= max && tick_4 >= min &&
                    <>
                        <Line points={[width-15,majorTickYPos(tick_4),width,majorTickYPos(tick_4)]} stroke="white"/>
                        <Text text={`${tick_4}`} x={10} y={majorTickYPos(tick_4)} offsetY={7} width={30} align="right" fill="white" fontSize={15}/>
                    </>
                }

                { tick_5 <= max && tick_5 >= min &&
                    <>
                        <Line points={[width-15,majorTickYPos(tick_5),width,majorTickYPos(tick_5)]} stroke="white"/>
                        <Text text={`${tick_5}`} x={10} y={majorTickYPos(tick_5)} offsetY={7} width={30} align="right" fill="white" fontSize={15}/>
                    </>
                }

                { tick_6 <= max && tick_6 >= min &&
                    <>
                        <Line points={[width-20,majorTickYPos(tick_6),width,majorTickYPos(tick_6)]} stroke="white"/>
                        <Text text={`${tick_6}`} x={10} y={majorTickYPos(tick_6)} offsetY={7} width={30} align="right" fill="white" fontSize={15}/>
                    </>
                }
            </Group>
            

            <Line points={[
                2, height/2-12,
                45, height/2-12,
                45, height/2-22,
                width-8, height/2-22,
                width-8, height/2-5,
                width, height/2,
                width-8, height/2+5,
                width-8, height/2+22, 
                45, height/2+22,
                45, height/2+12, 
                2, height/2+12
                ]} fill="black" stroke="white" strokeWidth={1} closed={true} 
            />

            {/* Readout - fixed digits */}
            <Group clip={{x:0, y:height/2-11, width: 45, height: 22}}>
                <Text text={`${(fixedValue) || ""}`} x={0} y={fixedDigitYPos(0)} width={42} offsetY={10} fill="white" align="right" fontSize={18}/>
                <Text text={`${(fixedValue + 1) || ""}`} x={0} y={fixedDigitYPos(1)} width={42} offsetY={10} fill="white" align="right" fontSize={18}/>
            </Group>

            <Group clip={{x:35, y:height/2-20, width: 25, height: 40}}> 
                <Text text={minorTickLabel(minorTick1)} x={35} y={minorTickYPos(minorTick1)} width={23} offsetY={10} fill="white" align="right" fontSize={18}/>
                <Text text={minorTickLabel(minorTick2)} x={35} y={minorTickYPos(minorTick2)} width={23} offsetY={10} fill="white" align="right" fontSize={18}/>
                <Text text={minorTickLabel(minorTick3)} x={35} y={minorTickYPos(minorTick3)} width={23} offsetY={10} fill="white" align="right" fontSize={18}/>
                <Text text={minorTickLabel(minorTick4)} x={35} y={minorTickYPos(minorTick4)} width={23} offsetY={10} fill="white" align="right" fontSize={18}/>
            </Group>
            
        </Group>
    )
}