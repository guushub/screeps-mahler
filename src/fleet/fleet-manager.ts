import { Fleet } from "./fleet";

export class FleetManager {
    fleetInfos: FleetInfo[] = [];
    private buildQueue: FleetInfo[] | undefined;

    constructor(public spawn: StructureSpawn) {

    }

    loop() {
        this.runFleets();

        const buildQueue = this.getBuildQueue();
        // if(buildQueue) console.log(buildQueue.map(fleetInfo => fleetInfo.fleet.fleetName).join(" - "));
        if(buildQueue && buildQueue.length > 0) {
            const fleetToReinforce = buildQueue[0].fleet;
            this.reinforceFleet(fleetToReinforce);
        }
    }

    getBuildQueue() {
        this.updateBuildQueue();
        return this.buildQueue;
    }

    updateBuildQueue() {
        const constroller = this.spawn.room.controller;
        const fleetsToQueue = this.fleetInfos.filter(fleetInfo =>
            constroller &&
            constroller.level >= fleetInfo.rclLevel &&
            fleetInfo.fleet.mustReinforce()
        );

        this.buildQueue = fleetsToQueue;
    }

    addFleet(fleetInfo: FleetInfo) {
        this.fleetInfos.push(fleetInfo);
        this.fleetInfos.sort((fleetInfoA, fleetInfoB) => {
            // Sort descending
            return fleetInfoB.buildPriority - fleetInfoA.buildPriority
        });

        this.updateBuildQueue();
    }

    reinforceFleet(fleet: Fleet) {
        const reinforceResult = fleet.reinforce();
        if (reinforceResult >= 0) {
            this.updateBuildQueue();
        }
    }

    runFleets() {
        this.fleetInfos.forEach(fleetInfo => {
            fleetInfo.fleet.loop();
        });
    }
}

interface FleetInfo {
    fleet: Fleet;
    rclLevel: number;
    buildPriority: BuildPriority;
}


export enum BuildPriority {
    TRIVIAL,
    VERY_LOW,
    LOW,
    NORMAL,
    HIGH,
    VERY_HIGH,
    URGENT
}
