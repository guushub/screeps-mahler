export class Find {

    static structuresByType(structureType: StructureConstant, room?: Room) {
        const structures = this.getItemsWithStructureType(Game.structures, structureType, room);
        return structures;
    }

    static constructionSitesByType(structureType: StructureConstant, room?: Room) {
        const sites = this.getItemsWithStructureType(Game.constructionSites, structureType, room);
        return sites;
    }

    private static getItemsWithStructureType<T extends Structure | ConstructionSite>(
        itemsToSearch: {[itemName: string] : T},
        structureType: StructureConstant,
        room?: Room) {
            const results = Object.keys(itemsToSearch)
            .reduce((items, itemName) => {
                const result = itemsToSearch[itemName]
                if(result.structureType === structureType) {
                    if(!room) {
                        items.push(result);
                    } else if(result.room && result.room.name === room.name) {
                        items.push(result);
                    }
                }
                return items;
            }, [] as T[]);

            return results;
    }

    static closestEnergyDump(pos: RoomPosition) {
        const target = pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER) &&
                    structure.energy < structure.energyCapacity;
            }
        });

        if(target && (
            target.structureType === STRUCTURE_EXTENSION ||
            target.structureType === STRUCTURE_SPAWN ||
            target.structureType === STRUCTURE_TOWER
        )) {
            return target;
        }

        return;
    }

    static emptySpacesInRange(room: Room, pos: RoomPosition, range: number) {
        const stuffInRange = room.lookAtArea(pos.y - range, pos.x - range, pos.y + range, pos.x + range, false);
        const emptySpaces: RoomPosition[] = [];
        for (const y in stuffInRange) {
            if (stuffInRange.hasOwnProperty(y)) {
                const cols = stuffInRange[y];
                for (const x in cols) {
                    if (cols.hasOwnProperty(x)) {
                        const results = cols[x];
                        const hasBuilding = results.some(result => result.type === "constructionSite" || result.type === "structure")
                        if(!hasBuilding) {
                            const emptyPos = new RoomPosition(Number(x), Number(y), room.name);
                            emptySpaces.push(emptyPos);
                        }
                    }
                }
                
            }
        }
        // const spaceInRange = stuffInRange.filter()
        return emptySpaces;
    }
}
