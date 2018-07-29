export abstract class Fleet {

    private nextSpawnId = 0;
    private priorityJobs: {[jobId: string]: {job: (creep: Creep) => void} } = {};

    constructor(public fleetName: string, public spawn: StructureSpawn, private minFleetSize: number, private maxFleetSize: number, public parts: BodyPartConstant[]) {
        //TODO: also this: pull outside here and put in some sort of fleet manager. Now I'll get too many loops.
        const creeps = this.getCreeps();
        creeps.forEach(creep => {
            const nameParts = creep.name.split("-");
            if(nameParts.length > 0) {
                const nSpawn = Number(nameParts[nameParts.length - 1])
                this.nextSpawnId = isNaN(nSpawn) || this.nextSpawnId < nSpawn ? this.nextSpawnId : nSpawn + 1;
            }

        });
    }

    abstract mainFunction(creep: Creep): void;

    //TODO: make it "step(creep: Creep)" and let manager figure out... to reduce loops.
    loop() {
        const creeps = this.getCreeps();
        creeps.forEach(creep => {
            const priorityJobId = (creep.memory as any).priorityJobId;
            if(priorityJobId && this.priorityJobs.hasOwnProperty(priorityJobId)) {
                const priorityJob = this.priorityJobs[priorityJobId];
                priorityJob.job(creep);
                return;
            }

            this.mainFunction(creep);
        });
    }

    addPriorityJob(job: (creep: Creep) => void, jobId: string) {
        this.priorityJobs[jobId] = {
            job: job
        };
    };

    startPriorityJob(jobId: string, nCreeps: number) {
        const creepsForJob = Object.keys(Game.creeps)
        .reduce((resultingCreeps, name) => {
            const creep = Game.creeps[name];
            const currentJobId = (creep.memory as any).priorityJobId as string;

            if((creep.memory as any).fleetName === this.fleetName && currentJobId !== jobId) {
                (creep.memory as any).currentJobId
                resultingCreeps.push(creep);

            }
            return resultingCreeps;
        }, [] as Creep[]);

    }

    endPriorityJob(jobId: string) {
        if(jobId in this.priorityJobs) {
            delete this.priorityJobs[jobId];
        }
    }

    reinforce() {
        const fleetSize = this.fleetSize();
        if(fleetSize < this.maxFleetSize) {
            return this.spawnCreep();
        }

        return -99;
    }

    fleetSize() {
        const creeps = this.getCreeps();
        if(!creeps) {
            return 0;
        }

        return creeps.length;
    }

    canReinforce() {
        const size = this.fleetSize();
        return size < this.minFleetSize;
    }

    mustReinforce() {
        const size = this.fleetSize();
        return size < this.minFleetSize;
    }

    private getCreepName() {
        return `${this.spawn.name}-${this.fleetName}-${this.nextSpawnId}`;
    }

    //TODO: Creat some sort of queue logic. ESB? :-p
    private spawnCreep() {
        const creepName = this.getCreepName();
        const spawnResult = this.spawn.spawnCreep(this.parts, creepName, {
            memory: {fleetName: this.fleetName}
        });
        if(spawnResult >= 0) {
            this.nextSpawnId = this.nextSpawnId + 1;
            // this.creeps.push(Game.creeps[creepName]);
        }

        return spawnResult;
    }

    //TODO: should be possible with property this.creeps.
    getCreeps(){
        const creeps = Object.keys(Game.creeps)
            .reduce((resultingCreeps, name) => {
                const creep = Game.creeps[name];
                if((creep.memory as any).fleetName === this.fleetName) {
                    resultingCreeps.push(creep);
                }
                return resultingCreeps;
            }, [] as Creep[]);
        return creeps;
      }

    any() {
        const creeps = this.getCreeps();
        return creeps.length > 0;
    }
}
