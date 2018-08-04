export const constructRoadNetworkIntraRoom = (room: Room) => {
    let structuresInNetwork: string[] = (room.memory as any).structuresInNetwork;
    structuresInNetwork = structuresInNetwork ? structuresInNetwork : [];
    const spawns = room.find(FIND_MY_SPAWNS).filter(spawn => structuresInNetwork.indexOf(spawn.id) < 0);
    const controller = room.controller && structuresInNetwork.indexOf(room.controller.id) < 0 ? room.controller : undefined;
    if(!controller && spawns.length === 0) {
        return ERR_NOT_FOUND;
    }

    const sources = room.find(FIND_SOURCES);
    if(sources.length === 0) {
        return ERR_NOT_FOUND;
    }

    for (let i = 0; i < spawns.length; i++) {
        const spawn = spawns[i];
        for (let j = 0; j < sources.length; j++) {
            const source = sources[j];
            const path = room.findPath(spawn.pos, source.pos);
            pathToRoadSites(path, room);
        }
        structuresInNetwork.push(spawn.id)
    }


    if(controller) {
        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const path = room.findPath(controller.pos, source.pos);
            pathToRoadSites(path, room);
        }
        structuresInNetwork.push(controller.id);
    }

    (room.memory as any).structuresInNetwork = structuresInNetwork;

    return OK;


}

// export const constructRoadToRoom = (room: Room) => {
//     let roomsInNetwork: string[] = (room.memory as any).roomsInNetwork ? (room.memory as any).roomsInNetwork : [];
//     const roomExits = Game.map.describeExits(room.name) as {[exitKey: string]: string};
//     const roomsToConnect = Object.keys(roomExits).reduce((rooms, exitKey) => {
//         if(!roomExits.hasOwnProperty(exitKey)) {
//             return rooms;
//         }
//         const roomName = roomExits[exitKey]
//         if(roomsInNetwork.indexOf(roomName) < 0) {
//             rooms.push(roomName)
//         }

//         return rooms;
//     }, [] as string[]);
    
//     if(roomsToConnect.length === 0) {
//         return ERR_NO_PATH;
//     }
    

// }

const pathToRoadSites = (path: PathStep[], room: Room) => {
    for (let i = 0; i < path.length; i++) {
        const step = path[i];
        room.createConstructionSite(new RoomPosition(step.x, step.y, room.name), STRUCTURE_ROAD);
    } 
}