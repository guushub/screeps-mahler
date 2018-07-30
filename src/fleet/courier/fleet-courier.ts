import { Fleet } from "../fleet";

export abstract class FleetCourier extends Fleet {

    constructor(type: FleetCourierType, spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number, parts = [CARRY, CARRY, MOVE, MOVE]) {
        super(type, spawn, minFleetSize, maxFleetSize, parts);
    }

    abstract mainFunction(creep: Creep): void;
    
}

export enum FleetCourierType {
    Energy = "EnergyCourier"
}
