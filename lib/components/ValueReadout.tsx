import type { DataPoint } from "../states/dataPoint";

type ValueReadoutProp = {
    dataPoint: DataPoint | undefined;
    label: string;
    unit?: string;
    decimalPoint?: number;
}

// TODO: show last updated timestamp on hover
export function ValueReadout({ dataPoint, label, unit = "", decimalPoint = 2 }: ValueReadoutProp) {
    return (
        <div className="border rounded-xs w-fit h-fit px-1 flex gap-2 text-sm">
            <div>{label}:</div>
            <div className="min-w-14">{dataPoint?.value.toFixed(decimalPoint)}</div>
            <div>{unit}</div>
        </div>
    )
}