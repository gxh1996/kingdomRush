import Monster from "./monster";
import AnimationPath from "../../common/animationPath";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterFactory extends cc.Component {

    @property({ type: [cc.Prefab] })
    private monsterPrefab: cc.Prefab[] = [];

    @property({ type: AnimationPath })
    private animationPath: AnimationPath = null;

    private monsterArray: Monster[] = [];
    /**
     * 待生成的怪物列表
     */
    private creMonList: number[] = [];
    private cT: number = 0;
    onLoad() { }

    createMonster(num: number) {
        this.creMonList.push(num);
    }

    getMonsterArray(): Monster[] {
        return this.monsterArray;
    }

    clearMonsters() {
        this.monsterArray = [];
        this.node.destroyAllChildren();
    }

    private _createMonster(num: number) {
        let m: cc.Node = cc.instantiate(this.monsterPrefab[num]);
        m.setPosition(cc.v2(0, 600));
        let mScr: Monster = m.getComponent("monster");
        this.monsterArray.push(mScr);
        this.node.addChild(m);

        mScr.set(0, this.animationPath.getWorldPath("road" + this.getRandomNumber(1, 3).toString()), this.monsterArray);
    }

    private getRandomNumber(min, max): number {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    update(dt) {
        if (this.creMonList.length > 0) {
            this.cT += dt;
            if (this.cT > 1) {
                this.cT = 0;
                this._createMonster(this.creMonList.shift());
            }

        }
    }
}
