import { FleetWorker, FleetWorkerType } from "./fleet-worker";
import { Find } from "utils/FindUtils";
import { WorkerTask } from "task/worker-task";

export class FleetBuild extends FleetWorker {

    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number, maxUnitCost = 1000) {
        super(FleetWorkerType.Build, spawn, minFleetSize, maxFleetSize, [WORK, WORK, CARRY, MOVE], maxUnitCost);
    }

    mainFunction(creep: Creep) {
        // const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        // const adjacentConstructionSite = this.adjacentConstructionSite(creep);

        if((creep.memory as any).isBuilding) {
            const buildResult = WorkerTask.build(creep);
            if(buildResult === OK) {
                return;
            }

            let repairResult = WorkerTask.repairStructures(creep);
            if(repairResult === OK) {
                return;
            }

            repairResult = WorkerTask.repairContainers(creep);
            if(repairResult === OK) {
                return;
            }

            if(creep.carry.energy === 0) {
                (creep.memory as any).isBuilding = false;
            }

        } else {
            const withdrawResult = WorkerTask.collectStoredEnergy(creep);
            if(withdrawResult === OK) {
                return;
            }

            const pickupResult = WorkerTask.collectDroppedEnergy(creep);
            if(pickupResult === OK) {
                return;
            }

            const harvestResult = WorkerTask.harvest(creep);
            if(harvestResult === OK) {
                return;
            }

            if(harvestResult === ERR_FULL || pickupResult === ERR_FULL) {
                (creep.memory as any).isBuilding = true;
                return;
            }

            const upgradeTask = WorkerTask.upgrade(creep);
            if(upgradeTask === OK) {
                return;
            }

            const dumpResult = WorkerTask.dumpEnergy(creep);
            if(dumpResult !== OK) {

            }
        }
    }
}
