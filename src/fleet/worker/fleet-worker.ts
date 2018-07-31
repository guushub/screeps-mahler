import { Fleet } from "../fleet";

export abstract class FleetWorker extends Fleet {

    constructor(type: FleetWorkerType, spawn: StructureSpawn, 
        minFleetSize: number, maxFleetSize: number, parts = [WORK, WORK, CARRY, MOVE], maxUnitCost = 1000) {
        super(type, spawn, minFleetSize, maxFleetSize, parts, 1000);
    }

    abstract mainFunction(creep: Creep): void;

}

export enum FleetWorkerType {
    Harvest = "Harvest",
    Build = "Build",
    Upgrade = "Upgrade"
}
