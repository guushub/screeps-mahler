import { Find } from "utils/FindUtils";

export class WorkerTask {

    static harvest(creep: Creep, assignedSource?: string) {
        if(creep.carryCapacity !== 0 && creep.carry.energy === creep.carryCapacity) {
            return ERR_FULL;
        }

        const source = assignedSource ? Game.getObjectById(assignedSource) as Source : creep.pos.findClosestByPath(FIND_SOURCES);
        if(!source) {
            return ERR_NOT_FOUND;
        }

        const harvestResult = creep.harvest(source);
        if(harvestResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveToTask(creep, source);
            return moveResult;
        }

        return harvestResult;
    }

    static collectDroppedEnergy(creep: Creep, assignedSource?: string) {
        if(creep.carry.energy === creep.carryCapacity) {
            return ERR_FULL;
        }

        const resource = assignedSource ? Game.getObjectById(assignedSource) as Resource : creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if(!resource) {
            return ERR_NOT_FOUND;
        }

        const pickupResult = creep.pickup(resource);
        if(pickupResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveToTask(creep, resource);
            return moveResult;
        }

        return pickupResult;
    }

    static dumpEnergy(creep: Creep) {
        const target = Find.closestEnergyDump(creep.pos);
        if(!target) {
            return ERR_NOT_FOUND;
        }

        const transferResult = creep.transfer(target, RESOURCE_ENERGY);
        if(transferResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveToTask(creep, target);
            return moveResult;
        }

        return transferResult;
    }

    static build(creep: Creep) {
        // Give extensions priority to build, because we want those for better creeps.
        const extensions = creep.room.find(FIND_CONSTRUCTION_SITES).filter(site => site.structureType === STRUCTURE_EXTENSION);
        let target: ConstructionSite | null;
        if(extensions.length > 0) {
            target = extensions[0];
        } else {
            target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        }

        if(!target) {
            return ERR_NOT_FOUND;
        }

        if(creep.carry.energy === 0) {
            return ERR_NOT_ENOUGH_ENERGY;
        }

        if(!creep.pos.inRangeTo(target, 3) && creep.carry.energy < creep.carryCapacity) {
            // This could mean:
            // - It's harvesting and energy source is not next to target
            // - It lost some energy on the way to target
            // - Or the target disappeared
            return ERR_NOT_ENOUGH_ENERGY;
        }

        const buildResult = creep.build(target);
        if(buildResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveToTask(creep, target);

            //{ visualizePathStyle: { stroke: '#ffffff' }
            return moveResult;
        }

        return buildResult;
    }

    static upgrade(creep: Creep) {
        const target = creep.room.controller;
        if(!target) {
            return ERR_NOT_FOUND;
        }

        if(creep.carry.energy === 0) {
            return ERR_NOT_ENOUGH_ENERGY;
        }

        if(!creep.pos.inRangeTo(target, 3) && creep.carry.energy < creep.carryCapacity) {
            // This could mean:
            // - It's harvesting and energy source is not next to target
            // - It lost some energy on the way to target
            // - Or the target disappeared
            return ERR_NOT_ENOUGH_ENERGY;
        }

        const upgradeResult = creep.upgradeController(target);
        if(upgradeResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveToTask(creep, target);
            //{ visualizePathStyle: { stroke: '#ffffff' }
            return moveResult;
        }

        return upgradeResult;

    }

    static buildRoadSite(creep: Creep) {
        const repairRoadResult = this.repairRoad(creep);
        if(repairRoadResult === OK) {
            return repairRoadResult;
        }
        // if(creep.room.controller && creep.room.controller.level < 2) {
        //     //TODO: This means that room without controller gets roads. Not so bad, because long travel needs speed. But check if this will do fine.
        //     return ERR_RCL_NOT_ENOUGH;
        // }
        const buildRoadSiteResult = creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
        return buildRoadSiteResult;
    }

    static repairRoad(creep: Creep) {
        const creepPos = creep.pos;
        const structuresAtPos = creepPos.lookFor(LOOK_STRUCTURES);
        const repairableRoads = structuresAtPos.filter(structure => structure.structureType === STRUCTURE_ROAD && structure.hits < structure.hitsMax);
        if(repairableRoads.length === 0) {
            // ROAD doesnt need repair (or isnt there);
            return ERR_NOT_FOUND;
        }

        const repairResults = creep.repair(repairableRoads[0]);
        return repairResults;
    }

    private static moveToTask(creep: Creep, target: RoomPosition | {pos: RoomPosition}) {
        const moveResult = creep.moveTo(target);
        //{ visualizePathStyle: { stroke: '#ffffff' }
        return moveResult === ERR_TIRED ? OK : moveResult;
    }

}
