import { FleetCourier, FleetCourierType } from "./fleet-courier";
import { WorkerTask } from "task/worker-task";

export class FleetCourierEnergy extends FleetCourier {

    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number) {
        super(FleetCourierType.Energy, spawn, minFleetSize, maxFleetSize);
    }

    mainFunction(creep: Creep) {

        const pickupResult = WorkerTask.collectDroppedEnergy(creep);
        if(pickupResult === OK) {
            return;
        }

        const dumpResult = WorkerTask.dumpEnergy(creep);
        if(dumpResult !== OK) {

        }

    };
    
}