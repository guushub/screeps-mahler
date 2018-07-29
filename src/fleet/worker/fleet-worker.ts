import { Fleet } from "../fleet";

export abstract class FleetWorker extends Fleet {

    constructor(type: FleetWorkerType, spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number) {
        super(type, spawn, minFleetSize, maxFleetSize, [WORK, WORK, CARRY, MOVE]);
        this.parts = this.determineBodyParts();
    }

    abstract mainFunction(creep: Creep): void;

    private determineBodyParts() {
        const parts = this.parts.map(part => part);
        const maxWorkerCost = this.spawn.room.energyCapacityAvailable < 1000 ? this.spawn.room.energyCapacityAvailable : 1000;
        let workerCost = this.bodyPartCost(parts);
        do {
            if(this.bodyPartCost(parts.concat(MOVE)) > maxWorkerCost) {
                return parts;
            }
            parts.push(MOVE);
            workerCost = this.bodyPartCost(parts);

            if(this.bodyPartCost(parts.concat(CARRY)) > maxWorkerCost) {
                return parts;
            }
            parts.push(CARRY);
            workerCost = this.bodyPartCost(parts);

            if(this.bodyPartCost(parts.concat(WORK)) > maxWorkerCost) {
                return parts;
            }
            parts.push(WORK);
            workerCost = this.bodyPartCost(parts);

        } while(workerCost <= maxWorkerCost)

        return parts;

    }

    private bodyPartCost(parts: BodyPartConstant[]) {
        let cost = 0;
        parts.forEach(part => {
            let add = 50;
            if(part === WORK) {
                add = 100;
            }
            cost = cost + add;
        });

        return cost;
    }
}

export enum FleetWorkerType {
    Harvest = "Harvest",
    Build = "Build",
    Upgrade = "Upgrade"
}
