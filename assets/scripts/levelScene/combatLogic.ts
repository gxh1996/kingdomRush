import Creature from "./creature";

export default class CombatLogic {

    private host: Creature = null;
    private enemys: Creature[] = null;

    constructor(host: Creature, enemys: Creature[]) {
        this.host = host;
        this.enemys = enemys;
    }

    /**
     * Thinks combat logic
     */
    think() {
        let eOfMinDis: [Creature, number] = this.getEnemyOfMinDis();
        if (eOfMinDis === null) {
            if (this.host.isTracking) {
                this.host.stopTrack();
                this.host.nonComLogic();
            }
            else if (!this.host.isNonComState)
                this.host.nonComLogic();

            return;
        }

        let e: Creature = eOfMinDis[0];
        let l: number = eOfMinDis[1];

        if (l <= this.host.rangeOfAttack) {
            if (this.host.isTracking) {
                this.host.stopTrack();
                this.host.attack(e);
            }
            else if (!this.host.isAttacking)
                this.host.attack(e);
        }
        else if (l <= this.host.rangeOfInvestigate) {
            if (this.host.isNonComState) {
                this.host.stopNonComLogic();
                this.host.track(e.getWPos());
            }
            else if (this.host.isNonComState === null) {
                this.host.isNonComState = false;
                this.host.track(e.getWPos());
            }
            else if (this.host.isTracking)
                this.host.refreshTrackTarget(e.getWPos());
            else if (this.host.isAttacking)
                return;
            else
                this.host.track(e.getWPos());
        }
        else if (!this.host.isNonComState)
            this.host.nonComLogic();
    }
    /**
     * 得到离宿主最近的敌人
     */
    private getEnemyOfMinDis(): [Creature, number] {
        if (this.enemys.length === 0)
            return null;

        let minE: Creature = this.enemys[0];
        let cp: cc.Vec2 = this.host.node.getPosition();
        let ep: cc.Vec2 = minE.node.getPosition();
        let minL: number = cp.sub(ep).mag();
        for (let i = 1; i < this.enemys.length; i++) {
            let e: Creature = this.enemys[i];
            ep = e.node.getPosition();
            let l: number = cp.sub(ep).mag();
            if (l < minL) {
                minL = l;
                minE = e;
            }
        }
        return [minE, minL];
    }
}
