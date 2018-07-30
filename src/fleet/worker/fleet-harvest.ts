import { FleetWorker, FleetWorkerType } from "./fleet-worker";
import { Find } from "utils/FindUtils";
import { WorkerTask } from "task/worker-task";

export class FleetHarvest extends FleetWorker {
    canCarry: boolean;

    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number, canCarry = true) {
        const parts = canCarry ? [WORK, WORK, CARRY, MOVE] : [WORK, WORK, MOVE, MOVE];
        super(FleetWorkerType.Harvest, spawn, minFleetSize, maxFleetSize, parts);
        this.canCarry = canCarry;
    }

    mainFunction(creep: Creep) {

        const harvestResult = WorkerTask.harvest(creep);
        if(harvestResult === OK) {
            return;
        }

        if(this.canCarry) {
            const dumpResult = WorkerTask.dumpEnergy(creep);
            if(dumpResult === OK) {
                WorkerTask.buildRoadSite(creep);
                return;
            }

            // As fallback, help with building!
            const buildResult = WorkerTask.build(creep);
            if(buildResult !== OK) {

            }
        }

    }
}

