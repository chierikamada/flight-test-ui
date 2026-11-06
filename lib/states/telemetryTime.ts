// TelemetryTime should be used when the components need to be in sync with the time kept by "master clock", which is different from a local system clock. TelemetryTime stores the time offset and provides methods to be used in lieu of Date.now() or new Date().

export class TelemetryTime {
    offsetMs: number | undefined;

    public setTelemetryTime(tmTime: Date) {
        if(tmTime === undefined) return;

        this.offsetMs = tmTime.getTime() - Date.now();
    }

    public getCurrentTelemetryTime(): Date | undefined {
        if(this.offsetMs === undefined) return undefined;
        return new Date(Date.now() + this.offsetMs);
    }
}
