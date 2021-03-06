import { Find } from "utils/FindUtils";

//TODO: check for enemies before moving to work.
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

    static collectStoredEnergy(creep: Creep, assignedSource?: string) {
        if(creep.carry.energy === creep.carryCapacity) {
            return ERR_FULL;
        }

        const container = assignedSource ? Game.getObjectById(assignedSource) as StructureContainer : creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (struct) => struct.structureType === STRUCTURE_CONTAINER && struct.store.energy > 0});
        if(!container) {
            return ERR_NOT_FOUND;
        }

        const pickupResult = creep.withdraw(container, RESOURCE_ENERGY);
        if(pickupResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveToTask(creep, container);
            return moveResult;
        }

        return pickupResult;
    }

    static dumpEnergy(creep: Creep) {
        if(creep.carry.energy === 0) {
            return ERR_NOT_ENOUGH_ENERGY;
        }

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

    static dropResource(creep: Creep, target: RoomPosition, resourceType: ResourceConstant, exact: boolean) {
        if(creep.carry.energy === 0) {
            return ERR_NOT_ENOUGH_ENERGY;
        }

        if((!exact && creep.pos.isNearTo(target)) || creep.pos.isEqualTo(target)) {
            const dropResult = creep.drop(resourceType);
            return dropResult;
        }

        const moveResult = this.moveToTask(creep, target);
        return moveResult;
        
    }

    static build(creep: Creep) {
        // Give extensions priority to build, because we want those for better creeps.
        const extensions = creep.room.find(FIND_CONSTRUCTION_SITES).filter(site => site.structureType !== STRUCTURE_ROAD && site.structureType !== STRUCTURE_RAMPART && site.structureType !== STRUCTURE_WALL);
        let target: ConstructionSite | null;
        if(extensions.length > 0) {
            target = extensions[0];
        } else {
            target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        }

        (creep.memory as any).assignment = target;

        if(!target) {
            return ERR_NOT_FOUND;
        }

        if(creep.carry.energy === 0) {
            return ERR_NOT_ENOUGH_ENERGY;
        }

        // if(!creep.pos.inRangeTo(target, 3) && creep.carry.energy < creep.carryCapacity) {
        //     // This could mean:
        //     // - It's harvesting and energy source is not next to target
        //     // - It lost some energy on the way to target
        //     // - Or the target disappeared
        //     return ERR_NOT_ENOUGH_ENERGY;
        // }

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

        // if(!creep.pos.inRangeTo(target, 3) && creep.carry.energy < creep.carryCapacity) {
        //     // This could mean:
        //     // - It's harvesting and energy source is not next to target
        //     // - It lost some energy on the way to target
        //     // - Or the target disappeared
        //     return ERR_NOT_ENOUGH_ENERGY;
        // }

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

    static repairStructures(creep: Creep) {
        const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax });
        if(!target) {
            return ERR_NOT_FOUND;
        }
        const repairResult = creep.repair(target);
        if(repairResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveToTask(creep, target);
            //{ visualizePathStyle: { stroke: '#ffffff' }
            return moveResult;
        }

        return repairResult;
    }

    static repairContainers(creep: Creep) {
        const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_CONTAINER && structure.hits < structure.hitsMax });
        if(!target) {
            return ERR_NOT_FOUND;
        }

        const repairResult = creep.repair(target);
        if(repairResult === ERR_NOT_IN_RANGE) {
            const moveResult = this.moveToTask(creep, target);
            //{ visualizePathStyle: { stroke: '#ffffff' }
            return moveResult;
        }

        return repairResult;
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

    static moveToTask(creep: Creep, target: RoomPosition | {pos: RoomPosition}) {
        const moveResult = creep.moveTo(target);
        //{ visualizePathStyle: { stroke: '#ffffff' }
        return moveResult === ERR_TIRED ? OK : moveResult;
    }

}
