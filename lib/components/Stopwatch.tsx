import { useEffect, useRef, useState } from "react";

type ThresholdType = "above" | "below";

type StopwatchProp = {
    label?: string;
    value?: number;
    thresholdVal?: number;
    thresholdType?: ThresholdType;
    resetBetween?: boolean;
}

function formatElapsed(ms: number): string {
    const totalMs = Math.floor(ms);
    const hours = Math.floor(totalMs / 3_600_000);
    const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
    const seconds = Math.floor((totalMs % 60_000) / 1000);
    const millis = totalMs % 1000;
    const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(millis, 3)}`;
}

export function Stopwatch({ label = "Stopwatch", value, thresholdVal, thresholdType = "above", resetBetween = true }: StopwatchProp) {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef<number>(undefined);

    // performance.now() value corresponding to time = 0 for the current run
    const originRef = useRef(0);

    useEffect(() => {
        if (running) {
        // Deduct already elapsed time to resume exactly where it was paused
        originRef.current = performance.now() - time;
        
        intervalRef.current = setInterval(() => {
            setTime(performance.now() - originRef.current);
        }, 10);
        } else {
            clearInterval(intervalRef.current);
        }

        // Cleanup interval on component unmount or state shift
        return () => clearInterval(intervalRef.current);
    }, [running]);

    useEffect(() => {
        if (value === undefined || thresholdVal === undefined || thresholdType === undefined) return;
        let meetsThreshold = false;
        switch (thresholdType) {
            case "above":
                meetsThreshold = (value > thresholdVal);
                break;
            case "below":
                meetsThreshold = (value < thresholdVal);
                break;
        }

        if (meetsThreshold) {
            if (!running && resetBetween) {
                setTime(0);
            }
            setRunning(true);
        } else {
            setRunning(false)
;        }

    }, [value, thresholdVal, thresholdType]);

    const handleStartStop = () => {
        setRunning(!running);
    };

    const handleReset = () => {
        setRunning(false);
        setTime(0);
    };

    const buttonClass = "border rounded-xs px-2 disabled:opacity-40 hover:enabled:cursor-pointer";

    return (
        <div className="border rounded-sm w-fit h-fit p-2 flex flex-col gap-1">
            {label && <div className="text-md">{label}:</div>}
            <div className="font-mono tabular-nums text-2xl">{formatElapsed(time)}</div>
            <div className="flex items-center gap-2 text-sm">
                <button className={buttonClass} onClick={handleStartStop} disabled={running || thresholdVal !== undefined}>Start</button>
                <button className={buttonClass} onClick={handleStartStop} disabled={!running || thresholdVal !== undefined}>Stop</button>
                <button className={buttonClass} onClick={handleReset} disabled={(!running && time === 0) || thresholdVal !== undefined} >Reset</button>
            </div>
            
        </div>
    )
}
